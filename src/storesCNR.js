import { rollup } from 'd3-array'
import lunr from 'lunr'

import { readable, writable, derived, get } from 'svelte/store'

export const people = readable(new Map(), function start(set) {
    fetch('https://www.iit.cnr.it/expPeople.php')
        .then(async function (response) {
            let data = await response.json()
            set(new Map(data.map(d => [d.email, {...d, type: 'person'}])))
        })
})

export const room_positions = writable({})

export const rooms = derived(
	[people, room_positions],
	([$people, $room_positions]) => {
        // extract room information from the array of people
        let room_data = rollup($people.values(), v => ({id: v[0].stanza, stanza: v[0].stanza, piano: v[0].piano, edificio: v[0].edificio, ingresso: v[0].ingresso, people: v, type: 'room'}), d => d.stanza)
        
        // add a position property for each room, reading from
        Object.keys($room_positions).forEach(id => {
            if(room_data.has(id)) {
                room_data.get(id).position = $room_positions[id]
            }
        })

        return room_data
    }
)

export const search_index = derived(
	[people, rooms],
	([$people, $rooms]) => {
        let index = lunr(function () {
            this.ref('email')
            this.field('email')
            this.field('nome')
            this.field('cognome')

            let docs = Array.from($people).map(d => d[1])
            docs.forEach(function (doc) {
                this.add(doc)
            }, this)
        })
        
        return index
    }
)

export function search(query) {
    if(query == '') {
        return []
    }
    
    return get(search_index).search(`${query}*`).map(d => get(people).get(d.ref))
}

export function getQualifica(person) {
    return person.qualifica ? person.qualifica : 'Personale Esterno'
}

export function getImmagine(person) {
    return `url('https://www.iit.cnr.it/sites/default/files/images/people/${person.immagine.replace("'",'')}')`
}