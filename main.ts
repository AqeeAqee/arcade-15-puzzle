enum Direction { UP, DOWN, LEFT, RIGHT }

namespace NumberTiles {
    const MaxTotalRow = 4
    const MaxTotalCol = 4
    export let totalRow = 4
    export let totalCol = 4

    const numberTiles: Tile[][] = [];
    let emptyTile: { row: number, column: number } = { row: 0, column: 0 };

    function get(row: number, column: number): Tile {
        if (row < 0 || row >= totalRow || column < 0 || column >= totalCol) {
            return null;
        }
        return numberTiles[row][column];
    }

    export function initTiles() {
        const bg = scene.backgroundImage()
        bg.fill(13)
        bg.fillRect(25, 4, 24 * 4 + 3 * 5, 24 * 4 + 3 * 5, 15)
        let n = 1
        for (let i = 0; i < MaxTotalRow; i++) {
            bg.fillRect(25 + i * 27, 4, 3, 24 * 4 + 3 * 5, 12)
            bg.fillRect(25, 4 + i * 27, 24 * 4 + 3 * 5, 3, 12)
            if (i < totalRow)
                numberTiles.push([])
            for (let j = 0; j < MaxTotalCol; j++) {
                if (i < totalRow && j < totalCol) {
                    numberTiles[i].push(null)
                    if (n != (totalCol * totalRow))
                        numberTiles[i][j] = new Tile(n++, i, j);
                } else
                    bg.fillCircle(40 + j * 27, 19 + i * 27, 5, 12)
            }
        }
        bg.fillRect(25 + MaxTotalCol * 27, 4, 3, 24 * 4 + 3 * 5, 12)
        bg.fillRect(25, 4 + MaxTotalRow * 27, 24 * 4 + 3 * 5, 3, 12)

        emptyTile.row = totalRow - 1
        emptyTile.column = totalCol - 1;
    }

    function solved(): boolean {
        let c = 1;
        for (let row = 0; row < totalRow; ++row) {
            for (let column = 0; column < totalCol; ++column) {
                const tile = get(row, column);
                if (!tile && c <= (totalCol * totalRow - 1)) {
                    return false;
                }
                if (tile.n !== c) {
                    return false;
                }
                if (c === (totalCol * totalRow - 1)) {
                    return true;
                }
                ++c;
            }
        }
        return true;
    }

    function move(fromRow: number, fromColumn: number, toRow: number, toColumn: number, animate: boolean): boolean {
        const tile = get(fromRow, fromColumn);
        if (tile) {
            numberTiles[toRow][toColumn] = tile;
            tile.set(toRow, toColumn, animate);
            emptyTile.row = fromRow
            emptyTile.column = fromColumn;
            numberTiles[fromRow][fromColumn] = null;
            return true;
        } else {
            return false;
        }
    }

    function moveDir(direction: Direction, animate: boolean): boolean {
        if (direction === Direction.UP) {
            return move(emptyTile.row + 1, emptyTile.column, emptyTile.row, emptyTile.column, animate);
        } else if (direction === Direction.DOWN) {
            return move(emptyTile.row - 1, emptyTile.column, emptyTile.row, emptyTile.column, animate);
        } else if (direction === Direction.LEFT) {
            return move(emptyTile.row, emptyTile.column + 1, emptyTile.row, emptyTile.column, animate);
        } else if (direction === Direction.RIGHT) {
            return move(emptyTile.row, emptyTile.column - 1, emptyTile.row, emptyTile.column, animate);
        }
        return false;
    }

    function randomMove(): boolean {
        let lastDirection: Direction
        let direction: Direction
        do {
            direction = Math.randomRange(0, 3)
        } while (2 == Math.abs(lastDirection - direction));

        lastDirection = direction;
        return moveDir(direction, true);
    }

    export function shuffle(count: number) {
        while (count)
            if (randomMove())
                --count;
    }

    let moveInProgress: boolean = false;
    export function doMove(direction: Direction) {
        // The move must be finished, before another move can start
        if (!moveInProgress) {
            moveInProgress = true;
            if (moveDir(direction, true)) {
                if (solved()) {
                    pause(100);
                    game.over(true);
                }
            }
            moveInProgress = false;
        }
    }

}

let menuDone = false
let myMenu = miniMenu.createMenu(
    miniMenu.createMenuItem("  2 x 3  "),
    miniMenu.createMenuItem("  3 x 2  "),
    miniMenu.createMenuItem("  3 x 3  "),
    miniMenu.createMenuItem("  3 x 4  "),
    miniMenu.createMenuItem("  4 x 3  "),
    miniMenu.createMenuItem("  4 x 4  "),
)
myMenu.onButtonPressed(controller.A, (itemTitle, i) => {
    const dimension = itemTitle.split("x")
    NumberTiles.totalRow = parseInt(dimension[0])
    NumberTiles.totalCol = parseInt(dimension[1])
    myMenu.close()
    menuDone = true
})
pauseUntil(() => menuDone)

NumberTiles.initTiles();
pause(200);
scene.cameraShake(5, 500);
pause(600);

NumberTiles.shuffle(66)

controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
    NumberTiles.doMove(Direction.LEFT);
});
controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
    NumberTiles.doMove(Direction.RIGHT);
});
controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
    NumberTiles.doMove(Direction.UP);
});
controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
    NumberTiles.doMove(Direction.DOWN);
});

const transparent = 0;
const white = 1;
const red = 2;
const black = 15;
const backgroundColor = 13;
const gridBackgroundColor = black;
const gridColor = 12;