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
    this._player = actors.find(player => player.type === 'player');
    this.height = grid.length;
    this.width = this.grid.reduce((x, y) => {return Math.max(y.length, x)}, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  get player() {
    return this._player;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(newActor) {
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
          return this.grid[y][x];
        }
      }
    }
  }

  removeActor(delActor) {
    this.actors = this.actors.filter(actor => actor !== delActor);
  }

  noMoreActors(type) {
    return this.actors.find(actor => actor.type === type) === undefined;
  }

  playerTouched(obstacleType, touchActor) {
    if (this.status === null) {
      if (obstacleType === 'lava' || obstacleType === 'fireball') {
        return this.status = 'lost';
      }

      if (obstacleType === 'coin' && touchActor.type === 'coin' ) {
        this.removeActor(touchActor);
        if (this.noMoreActors(touchActor.type)) {
          return this.status = 'won';
        }
        
      }
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
  constructor(pos, speed) {
    super(pos, new Vector(1, 1), speed);
    
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed.x = this.speed.x * -1;
    this.speed.y = this.speed.y * -1;
  }
  
  act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' || level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' === 'lava') {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(2, 0));
  };
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 2));
  };
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.initPos = this.pos;
  };

  act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' || level.obstacleAt(this.getNextPosition(time), this.size) === 'wall' === 'lava') {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }

  handleObstacle() {
    this.pos = this.initPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector()) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.startPos = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector()) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }

  get type() {
    return 'player';
  }
}

const schemas = [
  [
    '         ',
    '|        ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @o      ',
    'xxx      ',
    '         '
  ],
  [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@        ',
    'x  o o   ',
    '   xxx   '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
