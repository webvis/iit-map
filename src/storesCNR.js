import { rollup } from 'd3-array'
import lunr from 'lunr'

import { readable, writable, derived, get } from 'svelte/store'

export const people = readable(new Map(), function start(set) {
    fetch('https://intranet.iit.cnr.it/map.php')
        .then(async function (response) {
            let data = await response.json()
            set( new Map(data.map(d => {
                let person = {...d, type: 'person'}
                if(get(room_positions).has(d.stanza)) { // WARNING possible timing issues
                    person.position = get(room_positions).get(d.stanza)
                }
                return [d.email, person]
            })) )
        })
})

export const pois = readable(new Map(), function start(set) {
    fetch('data/pois.json')
        .then(async function (response) {
            let data = await response.json()
            set( new Map(data.map(d => [d.id, {...d, position: {...d.position, layers: new Set(d.position.layers)}, type: 'poi'}] )) )
        })
})

export const room_positions = writable(new Map())

export const rooms = derived(
	[people, room_positions],
	([$people, $room_positions]) => {
        // extract room information from the array of people
        let room_data = rollup($people.values(), v => ({id: v[0].stanza, stanza: v[0].stanza, piano: v[0].piano, edificio: v[0].edificio, ingresso: v[0].ingresso, people: v, type: 'office'}), d => d.stanza)
        
        $room_positions.forEach((d, id) => {
            if(room_data.has(id)) {
                // add a position property to each exisiting room
                room_data.get(id).position = d
            }
            else {
                // add a new room
                room_data.set(id, {id, position: d, type: 'room'})
            }
        })

        return room_data
    }
)

function lunr_index_map(index, m) {
    let docs = Array.from(m).map(d => d[1])
    docs.forEach(function (doc) {
        index.add(doc)
    })
}

export const people_index = derived(people,
	($people) => {
        let index = lunr(function () {
            this.pipeline.remove(lunr.stemmer)
            this.searchPipeline.remove(lunr.stemmer)

            this.ref('email')
            this.field('email')
            this.field('nome')
            this.field('cognome')
            this.field('qualifica')

            lunr_index_map(this, $people)
        })
        return index
    }
)

export const rooms_index = derived(rooms,
	($rooms) => {
        let index = lunr(function () {
            this.pipeline.remove(lunr.stemmer)
            this.searchPipeline.remove(lunr.stemmer)

            this.ref('id')
            this.field('id')

            lunr_index_map(this, $rooms)
        })
        return index
    }
)

export function search(query) {
    if(query == '') {
        return []
    }

    let actual_query = query.trim().split(/\s+/).map(term => '+'+term+'*').join(' ')
    
    let resulting_people = get(people_index).search(`${actual_query}`).map(d => get(people).get(d.ref))
    let resulting_rooms = get(rooms_index).search(`${actual_query}`).map(d => get(rooms).get(d.ref))
    
    return resulting_people.concat(resulting_rooms)
}

export function getQualifica(person) {
    return person.qualifica ? person.qualifica : 'Personale Esterno'
}

export function getImmagine(person) {
    return `https://www.iit.cnr.it/wp-content/themes/cnr/foto_personali/${person.immagine.replace("'",'')}`
}
