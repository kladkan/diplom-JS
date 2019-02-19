'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(newVector) {
    if (!(newVector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор класса Vector');
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
      throw new Error('Атрибуты движущегося объекта должны быть объектами класса Vector');
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
      throw new Error('В качестве аргумента может быть только объект класса Actor');
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

  actorAt(newActor) {
    if (newActor === undefined) {
      throw new Error('Метод <actorAt> не может быть вызван без аргумента');
    } 
    if (!(newActor instanceof Actor)) {
      throw new Error('В качестве аргумента может быть только объект класса Actor');
    }

    for (let actor of this.actors) {
      if (actor.pos === newActor.pos) {
        return actor;
      }
    }

    for (let actor of this.actors) {
      if (newActor.bottom <= actor.top || newActor.left >= actor.right || newActor.top >= actor.bottom || newActor.right <= actor.left) {
        return actor;
      }
      return undefined;
    }  
  }

  obstacleAt(newPos, objSize) {
    if (!(newPos instanceof Vector) || !(objSize instanceof Vector)) {
      throw new Error('В качестве аргументов может быть только объект класса Actor');
    };

    if (newPos.x > 0) {
      if (objSize.right + newPos.x > this.width) {
        return 'wall';
      }
      if (this.grid[objSize.pos.y][objSize.right + newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[objSize.pos.y][objSize.right + newPos.x];
      }
    }

    if (newPos.x < 0) {
      if (objSize.left - newPos.x < 0) {
        return 'wall';
      }
      if (this.grid[objSize.pos.y][objSize.left - newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[objSize.pos.y][objSize.left - newPos.x];
      }
    }

    if (newPos.y > 0) {
      if (objSize.bottom + newPos.y > this.height) {
        return 'lava';
      }
      if (this.grid[objSize.bottom + newPos.y][objSize.pos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[objSize.bottom + newPos.y][objSize.pos.x];
      }
    }

    if (newPos.y < 0) {
      if (objSize.top - newPos.y < 0) {
        return 'wall';
      }
      if (this.grid[objSize.top - newPos.y][objSize.pos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[objSize.top - newPos.y][objSize.pos.x];
      }
    }
  }

  removeActor(delActor) {
    this.actors = this.actors.filter(actor => actor !== delActor);
  }

  noMoreActors(type) {
    if (this.actors.find(actor => actor.type === type) === undefined) {
      return true;
    }
    return false;
  }


}
/*
const myArray = [
{name: 'Bill', age: 15},
{name: 'Max', age: 40},
{name: 'Casey', age: 23},
]
const oldMan = myArray.find(function (man) {
return man.age > 50;
})
console.log(oldMan); // => undefined
Метод noMoreActors
Определяет, остались ли еще объекты переданного типа на игровом поле.

Принимает один аргумент — тип движущегося объекта, строка.

Возвращает true, если на игровом поле нет объектов этого типа (свойство type). Иначе возвращает false.
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