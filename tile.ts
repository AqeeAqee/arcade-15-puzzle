const white = 1;
const red = 2;
const black = 15;

class Tile {
    public static readonly GRID_THICKNESS = 3;
    public static readonly WIDTH = 24;
    private static readonly OFFSET_X = 25;
    private static readonly OFFSET_Y = 4;
    private _row: number;
    private _column: number;
    private _n: number;
    private sprite: Sprite;

    constructor(n: number, row: number, column: number) {
        const animationImage = image.create(Tile.WIDTH, Tile.WIDTH);
        this.sprite = sprites.create(animationImage);
        this.sprite.setPosition(Tile.calcX(column), Tile.calcY(row));
        const frames = 4;
        const step = animationImage.height / frames;
        for (let i = 0; i < frames; i++) {
            animationImage.fillRect((animationImage.width - i * step) / 2, (animationImage.height - i * step) / 2, i * step, i * step, Tile.colorFor(n));
            pause(10);
        }
        this.n = n;
        this._row = row;
        this._column = column;
    }

    private static calcX(column: number): number {
        return Tile.OFFSET_X + Tile.GRID_THICKNESS + Tile.WIDTH / 2 + column * (Tile.WIDTH + Tile.GRID_THICKNESS);
    }

    private static calcY(row: number): number {
        return Tile.OFFSET_Y + Tile.GRID_THICKNESS + Tile.WIDTH / 2 + row *  (Tile.WIDTH + Tile.GRID_THICKNESS);
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

    private static colorFor(n: number): number {
        return (n % 2 + Math.floor((n - 1) / 4)) % 2 === 0 ? red : white;
    }

    private static textColorFor(n: number): number {
        return (n % 2 + Math.floor((n - 1) / 4)) % 2 === 0 ? white : black;
    }

    private static print(n: number, img: Image, color: number) {
        const text = "" + n;
        const font = image.font5;
        let w = text.length * font.charWidth;
        let offset = (Tile.WIDTH - w) / 2 + 1;
        img.print(text, offset, (img.height - font.charHeight) / 2, color, font)
    }

    private static createImage(n: number): Image {
        const img = image.create(Tile.WIDTH, Tile.WIDTH);
        img.fill(Tile.colorFor(n));
        Tile.print(n, img, Tile.textColorFor(n))
        return img;
    }
}