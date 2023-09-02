const white = 1;
const red = 2;
const black = 15;

class Tile {
    private _row: number;
    private _column: number;
    private _n: number;
    private sprite: Sprite;
    static font = image.font8

    constructor(n: number, row: number, column: number, private preview = false) {
        this.sprite
        this.n = n;
        this.sprite.setPosition(Tile.calcX(column), Tile.calcY(row));
        if(!preview){
        const frames = 5;
            for (let i = 1; i <= frames; i++) {
                this.sprite.setScale(i / frames)
                pause(10);
            }
        }
        this._row = row;
        this._column = column;
    }

    public static calcX(column: number): number {
        return Board_Left + GAP + TILE_SIZE / 2 + column * (TILE_SIZE + GAP);
    }

    public static calcY(row: number): number {
        return Board_Top + GAP + TILE_SIZE / 2 + row * (TILE_SIZE + GAP);
    }

    set n(n: number) {
        if (this.sprite)
            this.sprite.setImage(this.createImage(n));
        else
            this.sprite = sprites.create(this.createImage(n))
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
            const steps = 8, stepX = (toX - this.sprite.x) / 8, stepY = (toY - this.sprite.y) / 8
            for (let i = 0; i < steps; i++){
                this.sprite.setPosition(this.sprite.x + stepX, this.sprite.y + stepY)
                pause(6)
            }
        } else
            this.sprite.setPosition(toX, toY);
        this._row = row;
        this._column = column;
    }

    private static colorFlip(n: number) {
        return (((n - 1) % Board.Columns + (n - 1) / Board.Columns) | 0) % 2 === 1
    }

    private static bgColorFor(n: number): number {
        return Tile.colorFlip(n) ? red : white;
    }

    private static textColorFor(n: number): number {
        return Tile.colorFlip(n) ? white : black;
    }

    private createImage(n: number): Image {
        const img = image.create(TILE_SIZE, TILE_SIZE);
        img.fill(Tile.bgColorFor(n));
        if(!this.preview)
            img.printCenter(n.toString(), (img.height - Tile.font.charHeight) >> 1, Tile.textColorFor(n), Tile.font)
        return img;
    }
}