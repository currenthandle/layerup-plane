# Task 1 - Airplane Control
## Hosted Link
[Live Link](https://currenthandle.github.io/layup-airplane) 

## Run Application
- Ensure `node` version `v20.9.0` and above
- Ensure `pnpm` is installed: 
```
npm i -g pnpm
```
- Clone: 
```
git@github.com:currenthandle/layup-airplane.git
```
- `cd layup-airplane`
- `pnpm i`
- `pnpm dev`
- Open browser to 
```http://localhost:5173/layup-airplane/```

## Trajectory Logic
- This game assume that the plane should wrap around to the other side of the screen when the plane crosses the viewport boundry.
- This game assumes that the trajectory will not move to the new bounds but stay in the same place when the viewport size increases (same disance in pixels from the center).
- In order maintain a high UX for the player, the application manages a set of trajectory fragments. Each time the plane cross the viewport boundry a new segment is created.
- Points are added to the front of the most recent segment, only.
- When the sum of points aross all trajectory segments hits the max points limit, the oldest point off the back of the oldest segment will be removed and added to the front of the newest segment.
- The segment shows the direction of travel or the plane and the velocity of the plane; the points are removed off the back of the trajectory at the same rate as the plane was moving when those trajectory points were orignally laid down on the canvas.

## Turn Logic
- The player controls rudder deflection.
- Rudder effectiveness increases with airspeed, enhancing turning capability.
- Inertia (resistance to directional change) increases with airspeed, reducing turn rate.

## Airspeed Logic
- The player controls throttle position.
- Throttle position determines engine RPM, which adjusts asymptotically over time.
- Engine RPM drives propeller thrust.
- Drag is proportional to the square of velocity, opposing thrust.
- Airspeed results from the balance of all thrust and drag forces acting on the plane.


