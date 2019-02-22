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
    this.player = actors.find(player => player.type === 'player');// надо получить объект player и добавить туда свойство type.
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
    const leftWall = Math.floor(newPos.x);
    const rightWall = Math.ceil(newPos.x + objSize.x);
    const topWall = Math.floor(newPos.y);
    const lava = Math.ceil(newPos.y + objSize.y);

    if (leftWall < 0 || rightWall > this.width || topWall < 0) {
      return 'wall';
    }
    if (lava > this.height) {
      return 'lava';
    }

    for (let x = leftWall; x < rightWall; x++) {
      for (let y = topWall; y < lava; y++) {
        if (this.grid[y][x] === 'wall' || this.grid[y][x] === 'lava') {
          return this.grid[y][x]; //
        }
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

  playerTouched(obstacleType, touchActor) {
    if (obstacleType === 'lava' || obstacleType === 'fireball') {
      return this.status = 'lost';
    }

    if (obstacleType === 'coin' && touchActor.type === 'coin' ) {
      this.removeActor(touchActor);
      return this.status = 'won';
    }
  }
}

class LevelParser {
  constructor (actorsDict) {
    this.actorsDict = actorsDict;
  }

  actorFromSymbol(actorSymbol) {
    if (actorSymbol) {
      return this.actorsDict[actorSymbol];
    }
  }

  obstacleFromSymbol(obstacleSymbol) {
    if (obstacleSymbol === 'x') {
      return 'wall';
    } else if (obstacleSymbol === '!') {
      return 'lava';
    }
  }

  createGrid(stringArray) {
    return stringArray.map(function(string) {
      return string.split('').map(function(symb) {
        if (symb === 'x') {
          return 'wall';
        } else if (symb === '!') {
          return 'lava';
        }
        return undefined;
      });
    });
  }

  createActors(stringArray) {
    const actorsArray = [];
    let self = this;
    stringArray.forEach(function(string, y) {
      string.split('').forEach(function(symb, x) {
        if (self.actorsDict[symb] === Actor) {
          //console.log(self.actorsDict[symb]);
          if (new self.actorsDict[symb](new Vector(x, y)) instanceof Actor) {
          actorsArray.push(new self.actorsDict[symb](new Vector(x, y)));
          }
        };
      });
    });
    return actorsArray;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }

}
//Пример использования
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;
      //console.log(actorsDict['@']);
const parser = new LevelParser(actorsDict);
      //console.log(parser.createActors(plan));
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
