# anymapper
### Visualize your data as a zoomable map

*anymapper* provides a collection of [Svelte](https://svelte.dev/) UI components. It follows a literal interpretation of Ben Shneiderman's [Visual Information-Seeking Mantra](https://infovis-wiki.net/wiki/Visual_Information-Seeking_Mantra), providing a familiar, Google Maps-like user interface. (add support for Material Design)

## Get started

Install the dependencies...

```bash
cd viskel
npm i
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.


## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).


## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## [Internal]
This creates a new repo that can pull from Viskel as the *upstream* remote, but with disabled pushes.
Create an empty repo *repoName*.

```bash
git clone https://github.com/webvis/viskel.git repoName
cd repoName
git remote rename origin upstream
git remote add origin https://github.com/webvis/repoName.git
```

Change the readme and commit the changes. Then:

```bash
git push -u origin master
git remote set-url --push upstream DISABLE
```
