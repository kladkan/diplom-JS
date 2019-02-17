'use strict';
class Vector {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  
    plus(newVector) {
      if (!(newVector instanceof Vector)) {
        throw new Error('Можно прибавлять к вектору только вектор типа Vector');
      };
  
      return new Vector(
        this.x + newVector.x,
        this.y + newVector.y
      );
    }
  
    times(multiplier) {
      return new Vector(
        this.x * multiplier,
        this.y * multiplier
      );
    }
  }
  
  //----------------------------
  class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
      if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
        throw new Error('Атрибуты движущегося объекта должны быть объектами типа Vector');
      };
      this.pos = pos;
      this.size = size;
      this.speed = speed;  
    }
  
    act() {
    }
    get left() {
      return this.pos.x;
    }  
    get top() {
      return this.pos.y;
    }
    get right() {
      return this.pos.x + this.size.x;
    }
    get bottom() {
      return this.pos.y + this.size.y;
    }
    get type() {
      return 'actor';
    }
  
    isIntersect(newActor) {
      if (newActor === undefined) {
        throw new Error('Метод <isIntersect> не может быть вызван без аргумента');
      } 
      if (!(newActor instanceof Actor)) {
        throw new Error('В качестве аргумента может быть только объект типа Actor');
      };

      if (newActor.bottom <= this.top || newActor.left >= this.right || newActor.top >= this.bottom || newActor.right <= this.left) {
        return false
      }

      if (this === newActor) {
        return false
      } 
      return true;
    }
  }

  //---------------------------------
  class Level {
    constructor(grid, actors) {
      this.grid = grid;
      this.actors = actors;
      this.player = actors.find(player => player.type === 'player');
      this.height = grid.length;
      this.width = Math.max(...grid.map(el => el.length));
      this.status = null;
      this.finishDelay = 1;
    }

    isFinished() {
      if (this.status !== null && this.finishDelay < 0) {
        return true;
      }
    }

    actorAt(actor) {
      if (actor === undefined) {
        throw new Error('Метод <actorAt> не может быть вызван без аргумента');
      } 
      if (!(actor instanceof Actor)) {
        throw new Error('В качестве аргумента может быть только объект типа Actor');
      }
      if (actor.pos === this.pos) {
        return actor;
      }
      

    }


  }
/*
Метод actorAt
Определяет, расположен ли какой-то другой движущийся объект в переданной позиции, и если да, вернёт этот объект.

Принимает один аргумент — движущийся объект, Actor. Если не передать аргумент или передать не объект Actor, метод должен бросить исключение.

Возвращает undefined, если переданный движущийся объект не пересекается ни с одним объектом на игровом поле.

Возвращает объект Actor, если переданный объект пересекается с ним на игровом поле. Если пересекается с несколькими объектами, вернет первый.
*/
//Пример кода
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}