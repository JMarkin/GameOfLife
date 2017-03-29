"use strict";

// Объявление канваса
const canvas = document.getElementById('canvas');
// Кисть
const ctx = canvas.getContext('2d');
let width=400;
let count=10;


//Класс ячейки
class Cell{

    constructor(x,y,width,height,live){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.live=live;
    }
// Очистка ячейки
    clearRect(){
        ctx.clearRect(this.x,this.y,this.width,this.height);
        this.drawBorder();
        this.live=false;
    }
// ЗАполнение ячейки
    fillRect(){
        ctx.fillRect(this.x,this.y,this.width,this.height);
        this.drawBorder();
        this.live=true;
    }
// Обрисовка барьеров ячейки
    drawBorder(){
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x+this.width, this.y);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x,this.height+this.y);
        ctx.moveTo(this.x+this.width, this.y);
        ctx.lineTo(this.x+this.width, this.y+this.height);
        ctx.moveTo(this.x, this.y+this.height);
        ctx.lineTo(this.x+this.width, this.y+this.height);
        ctx.stroke();
    }
}


//Сам класс Игры

class GameOfLife {

    constructor(sizeTable,countCell){
        canvas.setAttribute('width',sizeTable);
        canvas.setAttribute('height',sizeTable);
        ctx.fillStyle='#B0FA80';
        // Размер таблицы и Размер ячейки
        this.sizeTable=sizeTable;
        this.sizeCell=floor(sizeTable,countCell);
        // Массив ячеек
        GameOfLife.cells=new Array(countCell);
        let size=this.sizeCell;

        // Массив ожидающих что с ним случиться в текущем ходу
        GameOfLife.expected=[];
        for(let i=0;i<countCell;i++)
            GameOfLife.cells[i]=new Array(countCell);

        for(let i=0;i<countCell;i++)
            for(let j=0;j<countCell;j++)
                GameOfLife.cells[i][j]=new Cell(i*this.sizeCell,
                    j*this.sizeCell,
                    this.sizeCell,this.sizeCell,false);

        // Событие на клик по канвасу т.е. заполнение и не заполнение ячейки
        canvas.addEventListener('click',function (e) {
            let x=floor(e.clientX-8, size);
            let y= floor(e.clientY-8, size);
            if (GameOfLife.cells[x][y].live === true)
                GameOfLife.cells[x][y].clearRect();
            else
                GameOfLife.cells[x][y].fillRect();
        });
    }
    drawTable(){
        for(let i=0;i<=this.sizeTable;i+=this.sizeCell) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.sizeTable);
        }
        for(let i=0;i<=this.sizeTable;i+=this.sizeCell) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.sizeTable,i);
        }
        ctx.stroke();
    }
    // 1 Шаг игры
    step(){
        let dx=[-1,0,1];
        let dy=[-1,0,1];
        // Проходим по всем ячейкам и смотрим его соседей все запихиваем в массив ожидающих
        for(let x=0;x<GameOfLife.cells.length;x++)
            for(let y=0;y<GameOfLife.cells.length;y++) {


                let neighbors = 0;
                let sizeTable = GameOfLife.cells.length;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (x + dx[i] === x && y + dy[j] === y)
                            continue;
                        try {
                            neighbors += GameOfLife.cells[x + dx[i]][y + dy[j]].live ? 1 : 0;
                        } catch (e) {
                            // Тор
                            // Углы
                            if (x + dx[i] < 0 && y + dy[j] < 0)
                                neighbors += GameOfLife.cells[sizeTable - 1][sizeTable - 1].live ? 1 : 0;
                            else if (x + dx[i] < 0 && y + dy[j] >= sizeTable)
                                neighbors += GameOfLife.cells[sizeTable - 1][0].live ? 1 : 0;
                            else if (x + dx[i] >= sizeTable && y + dy[j] < 0)
                                neighbors += GameOfLife.cells[0][sizeTable - 1].live ? 1 : 0;
                            else if (x + dx[i] >= sizeTable && y + dy[j] >= sizeTable)
                                neighbors += GameOfLife.cells[0][0].live ? 1 : 0;
                            // Стороны
                            else if (x + dx[i] >= sizeTable)
                                neighbors += GameOfLife.cells[0][y + dy[j]].live ? 1 : 0;
                            else if (y + dy[j] >= sizeTable)
                                neighbors += GameOfLife.cells[x + dx[i]][0].live ? 1 : 0;
                            else if (y + dy[j] < 0)
                                neighbors += GameOfLife.cells[x + dx[i]][sizeTable - 1].live ? 1 : 0;
                            else if (x + dx[i] < 0)
                                neighbors += GameOfLife.cells[sizeTable - 1][y + dy[j]].live ? 1 : 0;
                            //console.log(x + dx[i],y + dy[j]);
                        }
                    }
                }
                if ((neighbors > 3 || neighbors <= 1) && GameOfLife.cells[x][y].live === true) {
                    GameOfLife.expected.push([x, y, false]);
                }
                else if (neighbors === 3)
                    GameOfLife.expected.push([x, y, true]);


                console.log(x, y, neighbors);
            }

        GameOfLife.expected.forEach(function (item) {
            if(item[2]===true)
                GameOfLife.cells[item[0]][item[1]].fillRect();
            else
                GameOfLife.cells[item[0]][item[1]].clearRect();

        });
        // Чистка ожидающих
        GameOfLife.expected=[];
    }

    // Просто много шагов
    static play(){
        GameOfLife.prototype.step();
        // Проверка на идет ли
        if (GameOfLife.running) {
            setTimeout(function () {
                GameOfLife.play();
            }, 200);
        }

    }

}

init();


function init(){
    let game = new GameOfLife(width,count);
    game.drawTable();
    let btnRun=document.getElementById('run');

    btnRun.addEventListener('click',function () {
        if(this.value=='Run'){
            GameOfLife.running=true;
            GameOfLife.play();
            this.value='Stop';
        }else{
            GameOfLife.running=false;
            this.value='Run';
        }
    });

    let btnStep=document.getElementById('step');
    btnStep.addEventListener('click',function () {
        game.step();
    });
}



function floor(a,b){
    return Math.floor(a/b);
}
