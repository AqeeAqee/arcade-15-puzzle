enum Direction { UP, LEFT, DOWN, RIGHT }
const bg = scene.backgroundImage()
let Board_Left = 0, Board_Top = 0
let GAP = 3, TILE_SIZE = 24
let INTERVAL = 0

namespace Board {
    export let Rows = 0, Columns = 0
    let emptyRow = 0, emptyCol = 0
    const boardCells: Tile[][] = [];
    const wallsHrz: boolean[][] = []
    const wallsVrt: boolean[][] = []
    const offsetDir = [[1, 0], [0, 1], [-1, 0], [0, -1]]

    export function initBoard(rows:number, columns:number) {
        Rows=rows
        Columns=columns
        if (Rows > 4 || Columns > 5) TILE_SIZE -= 4
        INTERVAL = GAP + TILE_SIZE
        const BOARD_WIDTH = INTERVAL * Columns + GAP
        const BOARD_HEIGHT = INTERVAL * Rows + GAP
        Board_Left = (screen.width - BOARD_WIDTH) >> 1
        Board_Top = (screen.height - BOARD_HEIGHT) >> 1

        bg.fill(13)
        bg.fillRect(Board_Left, Board_Top, BOARD_WIDTH, BOARD_HEIGHT, 12)
        for (let i = 0, n = 1; i < Rows; i++) {
            boardCells.push([])
            wallsHrz.push([])
            wallsVrt.push([])
            for (let j = 0; j < Columns; j++) {
                bg.fillRect(Board_Left + GAP + j * INTERVAL, Board_Top + GAP + i * INTERVAL, TILE_SIZE, TILE_SIZE, 15)
                if (n != (Columns * Rows))
                    boardCells[i][j] = new Tile(n++, i, j);
                wallsHrz[i].push(false)
                wallsVrt[i].push(false)
            }
        }

        emptyRow = Rows - 1
        emptyCol = Columns - 1;
    }

    function get(row: number, col: number): Tile {
        return (0 <= row && row < Rows && 0 <= col && col < Columns) ?
            boardCells[row][col] :
            null
    }

    function solved(): boolean {
        let c = 1;
        for (let row = 0; row < Rows; ++row)
            for (let col = 0; col < Columns; ++col, c++) {
                const tile = get(row, col)
                if (tile && tile.n !== c)
                    return false;
            }
        return true;
    }

    function moveDir(direction: Direction, animate: boolean): boolean {
        if(!canMoveDir(emptyRow,emptyCol, direction)) return false
        const offsetRow = offsetDir[direction][0]
        const offsetCol = offsetDir[direction][1]
        const tile = get(emptyRow + offsetRow, emptyCol + offsetCol)
        if (tile) {
            boardCells[emptyRow][emptyCol] = tile;
            tile.set(emptyRow, emptyCol, animate);
            emptyRow += offsetRow
            emptyCol += offsetCol;
            boardCells[emptyRow][emptyCol] = null;
            return true;
        }
        return false;
    }

    let lastDirection: Direction
    function randomMove(): boolean {
        let direction: Direction
        do {
            direction = Math.randomRange(0, 3)
        } while (2 == Math.abs(lastDirection - direction)); //skip reverse moving

        if (moveDir(direction, true)) {
            lastDirection = direction;
            return true
        }
        return false
    }

    export function shuffle() {
        pause(200);
        scene.cameraShake(5, 500);
        pause(600);
        let count = (Columns * Rows) ** 2 >> 2
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
            miniMenu.createMenuItem("  5 x 5  "),
            miniMenu.createMenuItem("  5 x 6  "),
            miniMenu.createMenuItem("  5 x 7  "),
        )
        myMenu.title = miniMenu.createMenuItem("15 Puzzle")
        myMenu.onButtonPressed(controller.A, (itemTitle, i) => {
            const dimension = itemTitle.split("x")
            myMenu.close()
            initBoard(parseInt(dimension[0]), parseInt(dimension[1]))
            menuDone = true
        })
        pauseUntil(() => menuDone)
    }

    function canMoveDir(row:number,col:number, dir:Direction):boolean{
        const offsetRow = offsetDir[dir][0]
        const offsetCol = offsetDir[dir][1]
        const targetRow = row + offsetRow
        const targetCol = col + offsetCol

        if (offsetRow) {
            if (targetRow < 0 || targetRow >= Rows) return false
            if (wallsHrz[Math.min(row, targetRow)][col]) return false
        }
        if (offsetCol) {
            if (targetCol < 0 || targetCol >= Columns) return false
            if (wallsVrt[row][Math.min(col, targetCol)]) return false
        }
        return true
    }

    function countMovableDirections(row: number, col: number){
        let count=0
        for (let dir = 0; dir < 4; dir++)
            if (canMoveDir(row, col, dir))
                count++
        return count
    }

    export function addWalls(n: number) {
        while (n) {
            const HV = Math.percentChance(50) // true=horizontal, false=vertical
            const walls = HV ? wallsHrz : wallsVrt
            const tryRow = Math.randomRange(0, Rows - (HV ? 2 : 1))
            const tryCol = Math.randomRange(0, Columns - (HV ? 1 : 2))
            if (!walls[tryRow][tryCol]) {
                walls[tryRow][tryCol] = true
                if (countMovableDirections(tryRow, tryCol) >= 2 // left/top of the wall
                    && countMovableDirections(tryRow + (HV ? 1 : 0), tryCol + (HV ? 0 : 1)) >= 2) { // right/bottom of the wall
                    if (HV)
                        bg.fillRect(Board_Left + GAP + tryCol * INTERVAL + 2, Board_Top + (tryRow + 1) * INTERVAL + 1, TILE_SIZE - 4, 1, 5)
                    else
                        bg.fillRect(Board_Left + (tryCol + 1) * INTERVAL + 1, Board_Top + GAP + tryRow * INTERVAL + 2, 1, TILE_SIZE - 4, 5)
                    n--
                } else
                    walls[tryRow][tryCol] = false
            }
        }
    }
}

Board.chooseDimension()
// Board.addWalls(Math.idiv(Board.Rows + Board.Columns - 4, 2))
Board.addWalls(Board.Rows + Board.Columns - 5)
Board.shuffle()

controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
    Board.doMove(Direction.LEFT);
});
controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
    Board.doMove(Direction.RIGHT);
});
controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
    Board.doMove(Direction.UP);
});
controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
    Board.doMove(Direction.DOWN);
});
