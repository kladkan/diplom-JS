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
  constructor(actorsDict) {
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

  createGrid(stringArray = []) {
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

  createActors(stringArray = []) {
    if (!this.actorsDict) {
      return [];
    }
    const actorsArray = [];
    stringArray.forEach((string, y) => {
      string.split('').forEach((symb, x) => {
        let item = this.actorFromSymbol(symb);
        if (typeof item == 'function') {
          if (new item instanceof Actor) {
            actorsArray.push(new item(new Vector(x, y)));
          };
        }
      });
    });
    return actorsArray;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, speed);
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1, 1)
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }

  handleObstacle() {
    this.speed.x = this.speed.x * -1;
    this.speed.y = this.speed.y * -1;
  }
  
  act(time, level) {
    this.getNextPosition(time);
    if (level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' || level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' === 'lava') {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}