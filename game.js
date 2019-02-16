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
  
  /*
  //Пример кода
  const start = new Vector(30, 50);
  const moveTo = new Vector(5, 10);
  const finish = start.plus(moveTo.times(2));
  
  console.log(`Исходное расположение: ${start.x}:${start.y}`);
  console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
  */
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
      } elseif (!(newActor instanceof Actor)) {
        throw new Error('В качестве аргумента может быть только объект типа Actor');
      };
  
      //------- работыю над этой частью начало
      if (this.left === newActor.right || this.right === newActor.left + 1 || this.top === newActor.bottom - 1 || this.bottom === newActor.top + 1) {
        return true
      }
  
      if !(this.left === newActor.left || this.right === newActor.right || this.top === newActor.top || this.bottom === newActor.bottom) {
        return true;
      }
      return false;
      //-----------работыю над этой частью конец 
  
    }
  
  }
  /*
  Метод isIntersect
  Метод проверяет, пересекается ли текущий объект с переданным объектом, и если да, возвращает true, иначе – false.
  
  Принимает один аргумент — движущийся объект типа Actor. Если передать аргумент другого типа или вызвать без аргументов, то метод бросает исключение.
  
  Если передать в качестве аргумента этот же объект, то всегда возвращает false. Объект не пересекается сам с собой.
  
  Объекты, имеющие смежные границы, не пересекаются.
  */
  //Пример кода
  const items = new Map();
  const player = new Actor();
  items.set('Игрок', player);
  items.set('Первая монета', new Actor(new Vector(10, 10)));
  items.set('Вторая монета', new Actor(new Vector(15, 5)));
  
  function position(item) {
    return ['left', 'top', 'right', 'bottom']
      .map(side => `${side}: ${item[side]}`)
      .join(', ');  
  }
  
  function movePlayer(x, y) {
    player.pos = player.pos.plus(new Vector(x, y));
  }
  
  function status(item, title) {
    console.log(`${title}: ${position(item)}`);
    if (player.isIntersect(item)) {
      console.log(`Игрок подобрал ${title}`);
    }
  }
  
  items.forEach(status);
  movePlayer(10, 10);
  items.forEach(status);
  movePlayer(5, -5);
  items.forEach(status);
  /*
  Результат работы примера:
  Игрок: left: 0, top: 0, right: 1, bottom: 1
  Первая монета: left: 10, top: 10, right: 11, bottom: 11
  Вторая монета: left: 15, top: 5, right: 16, bottom: 6
  Игрок: left: 10, top: 10, right: 11, bottom: 11
  Первая монета: left: 10, top: 10, right: 11, bottom: 11
  Игрок подобрал Первая монета
  Вторая монета: left: 15, top: 5, right: 16, bottom: 6
  Игрок: left: 15, top: 5, right: 16, bottom: 6
  Первая монета: left: 10, top: 10, right: 11, bottom: 11
  Вторая монета: left: 15, top: 5, right: 16, bottom: 6
  Игрок подобрал Вторая монета
  */
  //---------------------------------
  class Level {
  
  }
  
  