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
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(player => player.type === 'player');
    this.height = grid.length;
    if (Math.max(...grid.map(el => el.length)) === -Infinity) {
      this.width = 0;
    } else {
      this.width = Math.max(...grid.map(el => el.length))
    }
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    }
    return false;
  }

  actorAt(newActor) {
    if (newActor === undefined) {
      throw new Error('Метод <actorAt> не может быть вызван без аргумента');
    }
    if (!(newActor instanceof Actor)) {
      throw new Error('В качестве аргумента может быть только объект класса Actor');
    }

    for (let actor of this.actors) {
      if (actor.pos === newActor) {
        return actor;
      }
    }

    return this.actors.find(actor => actor.isIntersect(newActor));

  }

  obstacleAt(newPos, objSize) {
    if (!(newPos instanceof Vector) || !(objSize instanceof Vector)) {
      throw new Error('В качестве аргументов может быть только объект класса Vector');
    };

      if (newPos.x + objSize.x > this.width) {
        return 'wall';
      }
      if (newPos.x < 0) {
        return 'wall';
      }
      if (objSize.y + newPos.y > this.height) {
        return 'lava';
      }
      if (newPos.y < 0) {
        return 'wall';
      }
      
      if (this.grid[newPos.y][objSize.x + newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[newPos.y][objSize.x + newPos.x];
      }

      
      if (this.grid[newPos.y][newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[newPos.y][newPos.x];
      }


      
      if (this.grid[objSize.y + newPos.y][newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[objSize.y + newPos.y][newPos.x];
      }

      
      if (this.grid[newPos.y][newPos.x] === undefined) {
        return undefined;
      } else {
        return this.grid[newPos.y][newPos.x];
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

  playerTouched(obstacleType, touchActor) {
    if (obstacleType === 'lava' || obstacleType === 'fireball') {
      return this.status = 'lost';
    }

    if (obstacleType === 'coin' && touchActor.type === 'coin' ) {
      if (!this.noMoreActors(obstacleType)) {
        this.removeActor(touchActor);
      } else {
        return this.status = 'won';
      }
    }
  }
  
}

/*
Метод playerTouched
Один из ключевых методов, определяющий логику игры. Меняет состояние игрового поля при касании игроком каких-либо объектов или препятствий.

Если состояние игры уже отлично от null, то не делаем ничего, игра уже и так завершилась.

Принимает два аргумента. Тип препятствия или объекта, строка. Движущийся объект, которого коснулся игрок, — объект типа Actor, необязательный аргумент.

Если первым аргументом передать строку lava или fireball, то меняем статус игры на lost (свойство status). Игрок проигрывает при касании лавы или шаровой молнии.

Если первым аргументом передать строку coin, а вторым — объект монеты, то необходимо удалить эту монету с игрового поля. Если при этом на игровом поле не осталось больше монет, то меняем статус игры на won. Игрок побеждает, когда собирает все монеты на уровне. Отсюда вытекает факт, что уровень без монет пройти невозможно.
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
console.log(player.pos);
const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);
//console.log(level.width);
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