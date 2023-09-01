enum Direction { UP, LEFT, DOWN, RIGHT }
const BOARD_X = -1, BOARD_Y = 4, GAP = 3, TILE_SIZE = 24

namespace NumberTiles {
    const MaxTotalRow = 4
    const MaxTotalCol = 6
    export let totalRow = 4
    export let totalCol = 4

    const numberTiles: Tile[][] = [];
    let emptyRow=0, emptyCol=0

    export function initTiles() {
        const INTERVAL = GAP + TILE_SIZE
        const BOARD_WIDTH = INTERVAL * MaxTotalCol + GAP, BOARD_HEIGHT = INTERVAL * MaxTotalRow + GAP
        const bg = scene.backgroundImage()
        bg.fill(13)
        bg.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT, 15)
        let n = 1
        for (let i = 0; i < MaxTotalRow; i++) {
            bg.fillRect(BOARD_X, BOARD_Y + i * INTERVAL, BOARD_WIDTH, GAP, 12)
            if (i < totalRow)
                numberTiles.push([])
            for (let j = 0; j < MaxTotalCol; j++) {
                bg.fillRect(BOARD_X + j * INTERVAL, BOARD_Y, GAP, BOARD_HEIGHT, 12)
                if (i < totalRow && j < totalCol) {
                    numberTiles[i].push(null)
                    if (n != (totalCol * totalRow))
                        numberTiles[i][j] = new Tile(n++, i, j);
                } else
                    bg.fillCircle(Tile.calcX(j), Tile.calcY(i), 5, 12)
            }
        }
        bg.fillRect(BOARD_X + MaxTotalCol * INTERVAL, BOARD_Y, GAP, BOARD_HEIGHT, 12)
        bg.fillRect(BOARD_X, BOARD_Y + MaxTotalRow * INTERVAL, BOARD_WIDTH, GAP, 12)

        emptyRow = totalRow - 1
        emptyCol = totalCol - 1;
    }

    function get(row: number, col: number): Tile {
        return (0 <= row && row < totalRow && 0 <= col && col < totalCol)?
            numberTiles[row][col]:
            null
    }

    function solved(): boolean {
        let c = 1;
        for (let row = 0; row < totalRow; ++row)
            for (let col = 0; col < totalCol; ++col,c++) {
                const tile = get(row,col)
                if (tile && tile.n !== c)
                    return false;
            }
        return true;
    }

    function moveDir(direction: Direction, animate: boolean): boolean {
        const offsetDir=[[1,0],[0,1],[-1,0],[0,-1]]
        const offsetRow = offsetDir[direction][0]
        const offsetCol = offsetDir[direction][1]
        const tile = get(emptyRow + offsetRow, emptyCol + offsetCol)
        if (tile) {
            numberTiles[emptyRow][emptyCol] = tile;
            tile.set(emptyRow, emptyCol, animate);
            emptyRow += offsetRow
            emptyCol += offsetCol;
            numberTiles[emptyRow][emptyCol] = null;
            return true;
        }
        return false;
    }

    let lastDirection: Direction
    function randomMove(): boolean {
        let direction: Direction
        do { direction = Math.randomRange(0, 3)
        } while (2 == Math.abs(lastDirection - direction)); //skip reverse moving

        if (moveDir(direction, true)){
            lastDirection = direction;
            return true
        }
        return false
    }

    export function shuffle() {
        pause(200);
        scene.cameraShake(5, 500);
        pause(600);
        let count=(totalCol*totalRow)**2>>1
        while (count)
            if (randomMove())
                --count
    }

    let moveInProgress: boolean = false;
    export function doMove(direction: Direction) {
        // The move must be finished, before another move can start
        if (!moveInProgress) {
            moveInProgress = true;
            if (moveDir(direction, true) && solved()) {
                pause(100);
                game.over(true, effects.confetti);
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
            miniMenu.createMenuItem("  4 x 5  "),
            miniMenu.createMenuItem("  4 x 6  "),
        )
        myMenu.title =miniMenu.createMenuItem("15 Puzzle"),
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
