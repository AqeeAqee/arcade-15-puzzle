enum Direction { UP, LEFT, DOWN, RIGHT }
const GAP = 3, TILE_SIZE = 24

namespace NumberTiles {
    export let Board_Left = 0, Board_Top = 0
    export let totalRow = 0, totalCol = 0
    let emptyRow=0, emptyCol=0
    const numberTiles: Tile[][] = [];

    export function initTiles() {
        const INTERVAL = GAP + TILE_SIZE
        const BOARD_WIDTH = INTERVAL * totalCol + GAP, BOARD_HEIGHT = INTERVAL * totalRow + GAP
        Board_Left = (screen.width - BOARD_WIDTH) >> 1
        Board_Top = (screen.height - BOARD_HEIGHT) >> 1
        const bg = scene.backgroundImage()
        bg.fill(13)
        bg.fillRect(Board_Left, Board_Top, BOARD_WIDTH, BOARD_HEIGHT, 12)
        for (let i = 0, n = 1; i < totalRow; i++) {
            if (i < totalRow)
                numberTiles.push([])
            for (let j = 0; j < totalCol; j++) {
                bg.fillRect(Board_Left+GAP + j * INTERVAL, Board_Top+GAP + i * INTERVAL, TILE_SIZE, TILE_SIZE, 15);pause(0)
                if (i < totalRow && j < totalCol) {
                    numberTiles[i].push(null)
                    if (n != (totalCol * totalRow))
                        numberTiles[i][j] = new Tile(n++, i, j);
                } else
                    bg.fillCircle(Tile.calcX(j), Tile.calcY(i), 5, 12)
            }
        }
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
            miniMenu.createMenuItem("  5 x 6  "),
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
