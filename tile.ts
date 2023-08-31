const white = 1;
const red = 2;
const black = 15;

class Tile {
    private _row: number;
    private _column: number;
    private _n: number;
    private sprite: Sprite;
    static font = image.font8

    constructor(n: number, row: number, column: number) {
        const animationImage = image.create(TILE_SIZE, TILE_SIZE);
        this.sprite = sprites.create(animationImage);
        this.sprite.setPosition(Tile.calcX(column), Tile.calcY(row));
        const frames = 4;
        const step = animationImage.height / frames;
        for (let i = 0; i < frames; i++) {
            animationImage.fillRect((animationImage.width - i * step) / 2, (animationImage.height - i * step) / 2, i * step, i * step, Tile.bgColorFor(n));
            pause(10);
        }
        this.n = n;
        this._row = row;
        this._column = column;
    }

    public static calcX(column: number): number {
        return BOARD_X + GAP + TILE_SIZE / 2 + column * (TILE_SIZE + GAP);
    }

    public static calcY(row: number): number {
        return BOARD_Y + GAP + TILE_SIZE / 2 + row *  (TILE_SIZE + GAP);
    }

    set n(n: number) {
        this.sprite.setImage(Tile.createImage(n));
        this._n = n;
    }

    get n(): number {
        return this._n;
    }

    get row(): number {
        return this._row;
    }
    
    get column(): number {
        return this._column;
    }

    public destroy() {
        this.sprite.destroy();
        this.sprite = null;
    }

    public set(row: number, column: number, animate: boolean) {
        const toX = Tile.calcX(column);
        const toY = Tile.calcY(row);
        if (animate) {
            const pauseMs = 2;
            if (row !== this._row || column !== this._column) {
                if (row > this._row) {
                    for (let y = this.sprite.y; y <= toY; y += 3) {
                        this.sprite.setPosition(toX, y);
                        pause(pauseMs);
                    }
                    
                } else if (row < this._row) {
                    for (let y = this.sprite.y; y >= toY; y -= 3) {
                        this.sprite.setPosition(toX, y);
                        pause(pauseMs);
                    }
                } else if (column > this._column) {
                    for (let x = this.sprite.x; x <= toX; x += 3) {
                        this.sprite.setPosition(x, toY);
                        pause(pauseMs);
                    }
                    
                } else if (column < this._column) {
                    for (let x = this.sprite.x; x >= toX; x -= 3) {
                        this.sprite.setPosition(x, toY);
                        pause(pauseMs);
                    }
                }
            }
        } else {
            this.sprite.setPosition(toX, toY);
        }
        this._row = row;
        this._column = column;
    }

    private static colorFlip(n:number){
        return (((n-1) % NumberTiles.totalCol + (n-1) / NumberTiles.totalCol)|0) % 2 === 1
    }

    private static bgColorFor(n: number): number {
        return Tile.colorFlip(n) ? red : white;
    }

    private static textColorFor(n: number): number {
        return Tile.colorFlip(n) ? white : black;
    }

    private static createImage(n: number): Image {
        const img = image.create(TILE_SIZE, TILE_SIZE);
        img.fill(Tile.bgColorFor(n));
        img.printCenter(n.toString(), (img.height - Tile.font.charHeight) >> 1, Tile.textColorFor(n), Tile.font)
        return img;
    }
}