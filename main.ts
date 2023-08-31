enum Direction { UP, DOWN, LEFT, RIGHT }

namespace NumberTiles {
    const MaxTotalRow = 4
    const MaxTotalCol = 4
    export let totalRow = 4
    export let totalCol = 4

    const numberTiles: Tile[][] = [];
    let emptyRow=0, emptyCol=0

    function get(row: number, col: number): Tile {
        return (0 <= row && row < totalRow && 0 <= col && col < totalCol)?
            numberTiles[row][col]:
            null
    }

    export function initTiles() {
        const bg = scene.backgroundImage()
        const left = 25, top = 4
        const gap = 3, tileSize = 24, interval = gap + tileSize, boardSize = interval * MaxTotalCol + gap
        bg.fill(13)
        bg.fillRect(left, top, boardSize, boardSize, 15)
        let n = 1
        for (let i = 0; i < MaxTotalRow; i++) {
            bg.fillRect(left + i * interval, top, gap, boardSize, 12)
            bg.fillRect(left, top + i * interval, boardSize, gap, 12)
            if (i < totalRow)
                numberTiles.push([])
            for (let j = 0; j < MaxTotalCol; j++) {
                if (i < totalRow && j < totalCol) {
                    numberTiles[i].push(null)
                    if (n != (totalCol * totalRow))
                        numberTiles[i][j] = new Tile(n++, i, j);
                } else
                    bg.fillCircle(left+gap+tileSize/2 + j * interval, top+gap+tileSize/2 + i * interval, 5, 12)
            }
        }
        bg.fillRect(left + MaxTotalCol * interval, top, gap, boardSize, 12)
        bg.fillRect(left, top + MaxTotalRow * interval, boardSize, gap, 12)

        emptyRow = totalRow - 1
        emptyCol = totalCol - 1;
    }

    function solved(): boolean {
        let c = 1;
        for (let row = 0; row < totalRow; ++row) {
            for (let col = 0; col < totalCol; ++col) {
                const tile = get(row,col)
                if (tile && tile.n !== c)
                    return false;
                c++
            }
        }
        return true;
    }

    function move(rowOffset: number, colOffset: number, animate: boolean): boolean {
        const tile = get(emptyRow + rowOffset, emptyCol + colOffset)
        if (tile) {
            numberTiles[emptyRow][emptyCol] = tile;
            tile.set(emptyRow, emptyCol, animate);
            emptyRow += rowOffset
            emptyCol += colOffset;
            numberTiles[emptyRow][emptyCol] = null;
            return true;
        } else {
            return false;
        }
    }

    function moveDir(direction: Direction, animate: boolean): boolean {
        switch (direction) {
            case Direction.UP:
                return move(+ 1, 0, animate);
            case Direction.DOWN:
                return move(- 1, 0, animate);
            case Direction.LEFT:
                return move(0, + 1, animate);
            case Direction.RIGHT:
                return move(0, - 1, animate);
            default:
                return false
        }
    }

    function randomMove(): boolean {
        let lastDirection: Direction
        let direction: Direction
        do { direction = Math.randomRange(0, 3)
        } while (2 == Math.abs(lastDirection - direction)); //skip reverse moving

        lastDirection = direction;
        return moveDir(direction, true);
    }

    export function shuffle() {
        pause(200);
        scene.cameraShake(5, 500);
        pause(600);
        let count=totalCol*totalRow*8
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
                    game.over(true, effects.confetti);
                }
            }
            moveInProgress = false;
        }
    }

    export function chooseDimension() {
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
    }
}

NumberTiles.chooseDimension()
NumberTiles.initTiles()
NumberTiles.shuffle()

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
