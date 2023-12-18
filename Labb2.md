# Home Security System Lab
This lab is a continuation of the [previous lab](/Labb1.md). If you have completed that lab you can begin, otherwise you will find a "finished" lab 1 solution [here](https://github.com/ActiveSolution/Frontend-Code-Labs/tree/main/src) to begin this lab from.

## Content of this lab (TODO)
1. [Skapa ett nytt Angular-projekt](#steg-1-skapa-ett-nytt-angular-projekt)
2. [Sätt komponentstrukturen](#sätt-komponentstrukturen)
    1. [Detektera rörelse](#steg-1-detektera-rörelse)
    2. [Larmkomponent](#steg-2-larmkomponent)
3. [Dela state - Property binding och Event emitter](#dela-state---property-binding-och-event-emitter)
   1. [@Output och Event Emitter](#steg-1-output-och-event-emitter)
   2. [Property binding via @Input](#steg-2-property-binding-via-input)
   3. [Signalera rätt inmatad kod](#steg-3-signalera-rätt-inmatad-kod)
4. [Trigga larmet](#trigga-larmet)
5. [Händelseström](#händelseström)
   1. [Skapa en service](#steg-1-skapa-en-event-service)
   2. [Nyttja DI i komponenterna](#steg-2-nyttja-di-i-komponenterna)
   3. [Skriv ut alla händelser](#steg-3-skriv-ut-alla-händelser)
   4. [Prenumera på events (RxJS)](#steg-4-prenumerera-på-events)
   5. [Pipes](#steg-5-pipes)

## Recap - where are we now
Last lab ended with us creating a log of events using a ```service``` that was ```injected``` into components. We had a brief look at ```RxJS``` and ```Observables``` to consume the stream of events. 

All together we have created a very simple alarm system that includes the following:

- A main component, or orchestrator, that is the responsible to listen to inputs from sensors and set the overall state of the system. This is the ```security-system.component.ts``` component.
- We have our keypad, which accepts a code and emits events telling the system whether or not a correct code is entered. ```security-keypad.component.ts```
- We have a motion sensor at ```motion-sensor.component.ts```
- An event log that subscribes to all events of the system. ```event-log.component.ts```

## This lab
We are going to explore a few concepts in more details. We will look at ```State management``` and ```data flow```. To our help we have ```RxJS``` to be able to work with Observables which will emit continous streams of sensor readings. We will also look at ```NgRx```, which is a global state store that uses RxJS as its backbone. 

We will work in iterations, starting without a state store, and then add that layer of 'complexity' and hopefully see why such a 'complexity' makes the system less complex.

## Create a continous sensor state change feed
Up til now, a change in state of a motion sensor was triggered manually. This is not the case in the real world. We are going to make the motion sensor component read only, so it just reads the state coming from an "external source" such as a web socket connection.

### Step 1: Create a sensor feed service
Using ```Angular CLI```, create a service that will hold the sensor state stream. Let's call it ```sensor-data-feed```. The feed will emit each state change a sensor makes. We need to define an interface to hold this data.

In the service file, define, and export, the IMotionSensorState interface below.

```typescript
export interface IMotionSensorState {
  state: boolean;
  previousState: boolean;
  message: string;
  timestamp: Date;
  name: string;
  id: string;
}
```

### Step 2: Build the state stream
In our service, define our stream as an Observable of our state

```typescript
motionSensorStream$: Observable<IMotionSensorState>;
```

Then we need to start emitting state changes. We will use RxJS to emit values. RxJS has a built in function, ```interval``` that emits values at the defined interval (ms).

Build upon our Observable by adding this code to the service constructor:

```typescript
this.motionSensorStream$ = interval(1000);
```

This wont compile, since ```interval``` itself is *not an Observable of our state*. So we need to ```map``` that to our state. To do so we need to start a ```pipe``` that includes a ```map``` function:

```typescript
this.motionSensorStream$ = interval(1000)
   .pipe(
      map(() => {
        return {
          state: false,
          previousState: false,
          message: 'No Motion Detected',
          timestamp: new Date(),
          name: 'Motion Sensor 1',
          id: '1',
        };
      }),
   )
```

Now we have something that compiles. But we are emitting the same state all the time. We need to set the value of our state. In true RxJS spirit we add another map infront of the one we have

```typescript
   map(() => Math.random() < 0.2),
```

In a chain of pipes, *data flows downwards*, i.e the output of a function becomes input in the next. So by adding that ```map``` infront of the state emitting map, we get the state (boolean) as an input parameter to that map function, which can then be updated to

```typescript
this.motionSensorStream$ = interval(1000)
   .pipe(
      map(() => Math.random() < 0.2),
      map((state) => {
        return {
          state: state, //<--- we can then use the passed in state
          previousState: false,
          message: state ? 'Motion Detected' : 'No Motion Detected',
          timestamp: new Date(),
          name: 'Motion Sensor 1',
          id: '1',
        };
      }),
   )
```
> **Note**
In a house hold, the most common state for a motion sensor is probably "off", or "no motion", since people wont be moving around constantly over the day. So lets bias our stream to "no motion", or ```false```.

> **Note**
One could be tempted to inline the state generating code (Math.random...) in the state map function, but that would *force us to keep it as a local variable* to be reused in the message property assignment. By adding that extra map, we keep our *functions as pure as possible*.

### Step 3: Plug in the state feed into our existing event feed
We already have a service that holds the systems events, ```event.service.ts```. Since a state change can be interpreted as an event it feels right to plug in the state feed into the event feed. This will also print out every motion state update in the browser in our ```event log component```.

In our event service, ```inject an instance``` of our new feed service into the ```constructor``` and ```subscribe``` to it. In the subscribe callback, *register each state change as an event* using the message and timestamp properties of the state change.

Since the feed is ```continous``` over time, the screen will quickly fill up with events, lets make the events array hold a maximum of ```20 items in a sliding fashion```, e.g. when the 21st element is added, remove the oldest. Modify the registerEvent method:

```typescript
  registerEvent(event: Event): void {
    if(this.events.length >= 20) {
      this.events.shift();
    }

    this.events.push(event);

    this.subject$.next(this.events);
  }
}
```

### Conclusion
We have started looking at ```RxJS``` and how it can be used to create a continous stream of motion sensor state updates. We have used ```interval``` to begin the feed and then ```piped``` it using the ```map``` function to map it to our state object. The resulting observable has then been consumed, or ```subscribed``` to in our event service which seamlessly hooked it up to our existing event stream.

The code should now look like [this](#create-a-continous-sensor-state-change-feed-1)

## Add support for multiple motion sensors
Only one sensor is no fun, let's add the possibility to add more. Instead of trying to modify the existing interval-pipe that emits state changes for our single sensor, we want to keep this observable as is. We want to reuse that Observable pipeline for each sensor and then merge all single-sensor observables into a single large one.

### Step 1: Make the observable reusable
Let's add a class to the bottom of the ```sensor-data-feed service``` and call this class ```MotionSensorStateEmitter```. Add a constructor parameter for the ```sensor id```.

Add a public method, ```startListen```, that returns an Observable of our state and then copy paste the existing Observable (interval...) into this method and return it. Adjust the properties using the constructor parameter accordingly.

### Step 2: Use the reusable observable
Now we need to create a few instances of our emitter, let's say 10. Replace the code in the services constructor with

```typescript
let motionSensors: MotionSensorStateEmitter[] = [];

    for (let i = 0; i < 10; i++) {
      motionSensors.push(new MotionSensorStateEmitter(i));
    }

    this.motionSensorStream$ = merge(
      ...motionSensors.map(sensor => sensor.startListen()),
    );
```

The interesting part is the RxJS ```merge``` method, which takes *many observables and merges them into a single observable*.

> **From the RxJS docs**
> "The merge operator is your go-to solution when you have multiple observables that produce values independently and you want to combine their output into a single stream"

Now you will have plenty of state changes showing in the browser. You might notice that the changes comes in ```batches of 1 second```. Let's make this more natural and add a randomness when the sensors emit.

Instead of having an interval of ```1000ms```, lets add a more random resolution and pass that value to ```interval```.

```typescript
var resolution = Math.max(2500, Math.random() * 10000);
```

This also emits less frequent, somewhere between 2.5 and 10 seconds.

### Step 3: Set the previous state property
You might have noticed the property ```previousState```, that we thus far haven't touched. To set this property we need access to the previous state object that has been emitted. ```RxJS``` has a method that will help us doing that. 

We will use the RxJS method ```scan```, which has a ```continous accumulation feature```, which means that for each item, we get passed the ```current item``` and the ```accumulated value```, which for us will be the ```previous item```, so that we can accumulate the current item.

> **RxJS docs**
> The key distinction of the scan operator when compared to other reduction operators is its continuous accumulation feature. With each emitted value, the accumulator function is applied, and the accumulated result is emitted instantaneously. You can remember this by the phrase "accumulate and emit on-the-go."

In our emitter class, let's add the ```scan``` method after our state map.

```typescript
scan((acc, curr) => {
   return {
      ...curr,
      previousState: acc.state,
   };
})
```

We are only interested in changing the previous state property, so we just ```spread``` out all the other properties. For ```previousState```, we use the accumulated (or previous item) state, which will be the previous state.

Looking in your browser, you should now see the previousState value in action.

### Conclusion
We have made our previous observable resusable and then added 10 motion sensors that are emitting continously. In doing so we have used two new ```RxJS``` functions, ```merge``` and ```scan```. We used merge to merge our 10 observables into a single observable that is being consumed by our event service. Pay attention to the fact that we did not have to change our event service doing so as the interface is the same as before.

Now, the code should look something like [this](#add-support-for-multiple-sensors)

## Use the motion sensor component
Our current motion sensor component has methods to manually emit motion. We are going to change this so that the component is read only and gets the current state passed in. This means we are changing what that component is, from a "physical" device to a representation of some device.

### Step 1: Refactor motion sensor component

In motion-sensor.component.ts, declare a new property, which can be ```bound``` from a parent component. Call the property ```state``` and make it ```required```. *Remember that you can tell the transpiler to be quiet about not being initialized by suffixing the propery name with ```!```*.

Remove all other code defined in the component class including the constructor. This component is now read only and does not keep any state of its own.

Replace the code in the template file (motion-sensor.component.html) with

```html
<div>
  {{ state.name }} - {{ state.message }}
</div>
```

There will now be an error in our orchestrator, ```security-system.component```, since the input parameter, ```state```, is a required property. This property is not bound as of now. Remove that motion sensor from the template of the orchestrator since we will render motion sensor dynamically going forward.

### Step 2: Consume sensor state feed in our security system
Start by defining an observable of ```IMotionSensorState array```.

```typescript
motionSensors$: Observable<IMotionSensorState[]>;
```

In the template file, iterate over this observable using ```ngFor``` and ```pipe``` it through the ```async pipe```. For each item, render the ```app-motion-sensor``` component passing in the state. Try on your own, if stuck you can have a [look here](#use-the-motion-sensor-component-1).

### Step 3: Consume the sensor feed
To consume the feed simply inject the sensor-data-feed service into the constructor of our system-security component and assign the observable to the services exposed observable.

```typescript
this.motionSensors$ = stream.motionSensorStream$;
```

You will notice that the list of motion sensors are growing, adding multiple sensors of the same ID. Let's build upon the feed and making it distinct by ID. To our help we have our friend, the ```scan``` method.

Scan, as you remember, has an ```accumulator feature```. We will use this to fix two things for us. 

- To transform the observable from Observable<IMotionSensorState> to Observable<IMotionSensorState[]>
- Make the observable unique/distinct by the motion sensor ID 

```typescript
    this.motionSensors$ = stream.motionSensorStream$.pipe(
      scan((acc, curr) => {
        const existingIndex = acc.findIndex(item => item.id === curr.id);
    
        if (existingIndex !== -1) {
          acc[existingIndex] = curr;
        } else {        
          acc.push(curr);
        }
    
        return acc;
      }, [] as IMotionSensorState[])
    )
  ```

The ```scan``` method takes a ```seed```, in this case the empty array. Then we push items into this array everytime a new sensor is found, otherwise update the existing.

### Conclusion
Now you should have a set of motion sensors rendered in the browser, these sensors should also update when state changes are pushed.

We used ```property binding``` to bind the state to our motion sensor component. We then again used ```scan``` to accumulate our unique array of sensors. 

Pay attention to the ```composability``` of the observables. They are created by each state emitter and then ```composed in two layers```; in ```sensor-data-feed.service``` and in ```security-system.component```. Very flexible and powerful.

## Add some UI structure and Material UI
Let's add Material UI to be able to style the site in a faster and nicer way. Styling is not really a part of this lab, but it might help to have a more structured layout with so many sensors added.

Install material ui for angular

```bash
ng add @angular/material
```

Then add the following css to motion-sensor.component.css

```css
.motion-sensor{
    display: flex;

    background-color: #ccc;
    padding: 5px;
    margin: 5px;
}

.motion-sensor.active{
    background-color: rgb(54, 228, 54);
}

.motion-sensor .icon {
    width: 50px;
    height: 50px;
}

.motion-sensor .icon .mat-icon{
    width: 100%;
    height: 100%;
}

.motion-sensor .info{
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 10px;
}
```

in motion-sensor.component.html add

```html
<div class="motion-sensor" ngClass="{{ state.state ? 'active': '' }}">
  <div class="icon">
    <mat-icon fontIcon="visibility" style="font-size: 48px"></mat-icon>
  </div>
  <div class="info">
    <div>{{ state.name }}</div>
    <div>{{ state.message }}</div>
  </div>
</div>
``` 

You will need to update ```motion-sensor.component.ts``` to import a ```Material UI module```. Add this module to the ```imports array``` (template dependency).

```typescript
import { MatIconModule } from '@angular/material/icon';
```

and in security-system.component.html add

```html
<mat-grid-list cols="5" rowHeight="100px">
  <div *ngFor="let sensor of motionSensors$ | async; trackBy: trackById">
    <mat-grid-tile>
      <app-motion-sensor [state]="sensor"></app-motion-sensor>
    </mat-grid-tile>
  </div>
</mat-grid-list>
```

You will need to update ```security-system.component.ts``` to import a ```Material UI module```. Add this module to the ```imports array``` (template dependency).

```typescript
import { MatGridListModule } from '@angular/material/grid-list';
```

> **Note**
> Feel free to tweak or add the css or UI elements of your choice. This is in no way considered good looking.

## Last touches
Now you should see 10 motions sensors layed out on your screen, but there are a few issues left.

- The sensors are moving around
- If you open dev tools and inspect a sensor, you will see that each sensor is replaced with a new each time a state changes. The reason is that the change detection is by reference, and there is a new reference each time a state change

To adress the first issue, we need to sort the observable in ```security-system.component.ts```, ```this.motionSensors$```. Try and sort by the sensors id.

To adress the second issue, you will need to find a way to tell Angular that the change detection should be by the sensors id.

If you want to validate your solution, or get stuck, check out the code [here]().

## Kodvalidering

### Create a continous sensor state change feed

sensor-data-feed.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Observable, interval, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorDataFeedService {
  constructor() {
    this.motionSensorStream$ = interval(1000)
      .pipe(
         map(() => Math.random() < 0.2),
         map((state) => {
            return {
               state: state,
               previousState: false,
               message: state ? 'Motion Detected' : 'No Motion Detected',
               timestamp: new Date(),
               name: 'Motion Sensor 1',
               id: '1',
            };
         }),
      )
  }

  motionSensorStream$: Observable<IMotionSensorState>;
}

export interface IMotionSensorState {
  state: boolean;
  previousState: boolean;
  message: string;
  timestamp: Date;
  name: string;
  id: string;
}
```

event.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { SensorDataFeedService } from './sensor-data-feed.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [];
  private subject$ = new ReplaySubject<Event[]>(10);

  events$: Observable<Event[]> = this.subject$.asObservable();

  constructor(sensorDataFeedService: SensorDataFeedService) { 
    sensorDataFeedService.motionSensorStream$.subscribe((data) => {
      this.registerEvent({ message: data.message, timestamp: data.timestamp });
    });
  }

  registerEvent(event: Event): void {
    if(this.events.length >= 20) {
      this.events.shift();
    }

    this.events.push(event);

    this.subject$.next(this.events);
  }
}

export interface Event {
  message: string;
  timestamp: Date;
}
```

### Add support for multiple sensors
sensor-data-feed.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Observable, interval, map, merge, scan } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorDataFeedService {
  constructor() {
    let motionSensors: MotionSensorStateEmitter[] = [];

    for (let i = 0; i < 10; i++) {
      motionSensors.push(new MotionSensorStateEmitter(i));
    }

    this.motionSensorStream$ = merge(
      ...motionSensors.map(sensor => sensor.startListen()),
    );
  }

  motionSensorStream$: Observable<IMotionSensorState>;
}

export interface IMotionSensorState {
  state: boolean;
  previousState: boolean;
  message: string;
  timestamp: Date;
  name: string;
  id: string;
}

class MotionSensorStateEmitter {
  constructor(private id: number) {
  }

  public startListen(): Observable<IMotionSensorState> {
    var resolution = Math.max(2500, Math.random() * 10000);

    return interval(resolution).pipe(
      map(() => Math.random() < 0.2),
      map((state) => {
        return {
          state: state,
          previousState: false,
          message: state ? 'Motion Detected' : 'No Motion Detected',
          timestamp: new Date(),
          name: `Motion Sensor ${this.id.toString()}`,
          id: this.id.toString(),
        };
      }),
      scan((acc, curr) => {
        return {
          ...curr,
          previousState: acc.state,
        };
      })
    );
  }
}
```

### Use the motion sensor component
security-system.component.html
```html
<div *ngFor="let sensor of motionSensors$ | async">
    <app-motion-sensor  [state]="sensor"></app-motion-sensor>
</div>
```

security-system.component.ts (only ctor changed)
```typescript
constructor(private eventService: EventService, stream: SensorDataFeedService){
    eventService.registerEvent({ message: 'Security system initialized', timestamp: new Date() });

    this.motionSensors$ = stream.motionSensorStream$.pipe(
      scan((acc, curr) => {
        const existingIndex = acc.findIndex(item => item.id === curr.id);
    
        if (existingIndex !== -1) {
          acc[existingIndex] = curr;
        } else {        
          acc.push(curr);
        }
    
        return acc;
      }, [] as IMotionSensorState[])
    )
  }
```

## Add some UI structure and Material UI
motion-sensor.component.html
```html
<div class="motion-sensor" ngClass="{{ state.state ? 'active': '' }}">
  <div class="icon">
    <mat-icon fontIcon="visibility" style="font-size: 48px"></mat-icon>
  </div>
  <div class="info">
    <div>{{ state.name }}</div>
    <div>{{ state.message }}</div>
  </div>
</div>
```

motion-sensor.component.css
```css
.motion-sensor{
    display: flex;

    background-color: #ccc;
    padding: 5px;
    margin: 5px;
}

.motion-sensor.active{
    background-color: rgb(54, 228, 54);
}

.motion-sensor .icon {
    width: 50px;
    height: 50px;
}

.motion-sensor .icon .mat-icon{
    width: 100%;
    height: 100%;
}

.motion-sensor .info{
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 10px;
}
```

security-system.component.html
```html
{{ alarmActive ? "[Parent] Larm på" : "[Parent]  Larm av" }}

<app-security-keypad
  [code]="code"
  (correctCodeInput)="onCodeMatch()"
></app-security-keypad>
<app-alarm-state *ngIf="alarmTriggered"></app-alarm-state>

<mat-grid-list cols="5" rowHeight="100px">
  <div *ngFor="let sensor of motionSensors$ | async; trackBy: trackById">
    <mat-grid-tile>
      <app-motion-sensor [state]="sensor"></app-motion-sensor>
    </mat-grid-tile>
  </div>
</mat-grid-list>
```

### Last touches
security-system.component.ts
```typescript
this.motionSensors$ = stream.motionSensorStream$.pipe(
   scan((acc, curr) => {
      const existingIndex = acc.findIndex(item => item.id === curr.id);
   
      if (existingIndex !== -1) {
         acc[existingIndex] = curr;
      } else {        
         acc.push(curr);
      }
   
      return acc;
   }, [] as IMotionSensorState[]),
   map((sensors) => sensors.sort((a, b) => a.id.localeCompare(b.id)))
)

...

trackById(index: number, sensor: IMotionSensorState): string {
    return sensor.id;
  }
```

security-system.component.html
```html
<div *ngFor="let sensor of motionSensors$ | async; trackBy: trackById">
```