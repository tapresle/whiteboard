# Multi-Screen Whiteboard

## Features
Runs on NodeJS and Socket.io, allows for multiple clients to connect and view the current whiteboard. A very naive attempt at preventing others from drawing at the same time has been implemented that prevents other users from drawing for ~5 seconds after someone else has started drawing. 

## How to run?
Make sure you've installed all dependencies, then run `npm run buildandstart` to compile the whiteboard.ts file and start up both the static http server and socket.io listener.

I've included the `http-server` module to serve up the static page that runs the app for simplicity sake.

If you want to test on other devices, make sure to change `localhost` to your computer's IP address in `index.html` and `whiteboard.ts/js` files and restart the app.

## Issues and pull requests
Have a feature you'd like to see? Please open an issue with details, or a pull request with the functionality and I'll be happy to review them.

## Next features
- Create custom keyed room
- Enter custom keyed room
- Line colors
- Text
- Images
- Shapes
- Mobile support for drawing (Viewing works currently!)
