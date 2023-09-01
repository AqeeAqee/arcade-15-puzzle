enum Direction { UP, LEFT, DOWN, RIGHT }
let Board_Left = 0, Board_Top = 0
const GAP = 3, TILE_SIZE = 24
const INTERVAL = GAP + TILE_SIZE
const bg = scene.backgroundImage()

namespace NumberTiles {
    export let totalRow = 0, totalCol = 0
    let emptyRow = 0, emptyCol = 0
    const boardCells: Tile[][] = [];
    const wallsHrz: boolean[][] = []
    const wallsVrt: boolean[][] = []
    const offsetDir = [[1, 0], [0, 1], [-1, 0], [0, -1]]

    export function initTiles() {
        const BOARD_WIDTH = INTERVAL * totalCol + GAP
        const BOARD_HEIGHT = INTERVAL * totalRow + GAP
        Board_Left = (screen.width - BOARD_WIDTH) >> 1
        Board_Top = (screen.height - BOARD_HEIGHT) >> 1

        bg.fill(13)
        bg.fillRect(Board_Left, Board_Top, BOARD_WIDTH, BOARD_HEIGHT, 12)
        for (let i = 0, n = 1; i < totalRow; i++) {
            boardCells.push([])
            for (let j = 0; j < totalCol; j++) {
                bg.fillRect(Board_Left + GAP + j * INTERVAL, Board_Top + GAP + i * INTERVAL, TILE_SIZE, TILE_SIZE, 15)
                if (n != (totalCol * totalRow))
                    boardCells[i][j] = new Tile(n++, i, j);
            }
        }

        emptyRow = totalRow - 1
        emptyCol = totalCol - 1;
    }

    function get(row: number, col: number): Tile {
        return (0 <= row && row < totalRow && 0 <= col && col < totalCol) ?
            boardCells[row][col] :
            null
    }

    function solved(): boolean {
        let c = 1;
        for (let row = 0; row < totalRow; ++row)
            for (let col = 0; col < totalCol; ++col, c++) {
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
        let count = (totalCol * totalRow) ** 2 >> 2
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
        )
        myMenu.title = miniMenu.createMenuItem("15 Puzzle")
        myMenu.onButtonPressed(controller.A, (itemTitle, i) => {
            const dimension = itemTitle.split("x")
            NumberTiles.totalRow = parseInt(dimension[0])
            NumberTiles.totalCol = parseInt(dimension[1])
            myMenu.close()
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
            if (targetRow < 0 || targetRow >= totalRow) return false
            if (wallsHrz[Math.min(row, targetRow)][col]) return false
        }
        if (offsetCol) {
            if (targetCol < 0 || targetCol >= totalCol) return false
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
        for (let i = 0, n = 1; i < totalRow; i++) {
            wallsHrz.push([])
            wallsVrt.push([])
            for (let j = 0, n = 1; j < totalCol; j++) {
                wallsHrz[i].push(false)
                wallsVrt[i].push(false)
        }}
        while (n) {
            if (Math.percentChance(50)) { //try horizontal wall
                const tryRow = Math.randomRange(0, totalRow - 2)
                const tryCol = Math.randomRange(0, totalCol - 1)
                if (!wallsHrz[tryRow][tryCol]) {
                    wallsHrz[tryRow][tryCol] = true
                    if (countMovableDirections(tryRow, tryCol) >= 2 && countMovableDirections(tryRow + 1, tryCol) >= 2) {
                        bg.fillRect(Board_Left + GAP + tryCol * INTERVAL + 1, Board_Top + (tryRow + 1) * INTERVAL + 1, TILE_SIZE - 2, 1, 5)
                        n--
                    }
                    else 
                        wallsHrz[tryRow][tryCol] = false
                }
            }
            else{//try vertical wall
                const tryRow = Math.randomRange(0, totalRow - 1)
                const tryCol = Math.randomRange(0, totalCol - 2)
                if (!wallsVrt[tryRow][tryCol]) {
                    wallsVrt[tryRow][tryCol] = true
                    if (countMovableDirections(tryRow, tryCol) >= 2 && countMovableDirections(tryRow, tryCol + 1) >= 2) {
                        bg.fillRect(Board_Left + (tryCol + 1) * INTERVAL + 1, Board_Top + GAP + tryRow  * INTERVAL + 1, 1 , TILE_SIZE - 2, 5)
                        n--
                    }
                    else 
                        wallsVrt[tryRow][tryCol] = false
                }
            }
        }
    }
}

NumberTiles.chooseDimension()
NumberTiles.initTiles()
NumberTiles.addWalls(Math.idiv(NumberTiles.totalRow + NumberTiles.totalCol - 4, 2))
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
