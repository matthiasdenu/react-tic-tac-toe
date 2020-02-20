
// Display the location for each move in the format (col, row) in the move history list.
// Bold the currently selected item in the move list.
// Rewrite Board to use two loops to make the squares instead of hardcoding them.
// Add a toggle button that lets you sort the moves in either ascending or descending order.
// When someone wins, highlight the three squares that caused the win.
// When no one wins, display a message about the result being a draw.

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(3).fill(Array(3).fill(null)),
                col: null,
                row: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            historyIsDescinding: false,
        };
    }

    handleClick(row, col) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.map((val) => val.slice());
        const xIsNext = this.state.xIsNext

        // The board of 9 entries will be full before the stepNumber arg matters
        let winnerObj = calculateWinner(squares, null)
        if (winnerObj.player || squares[row][col]) {
            // Skip remaining logic if someone has one or if space is occupied
            return;
        }

        squares[row][col] = xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
                row: row,
                col: col
            }]),
            stepNumber: history.length,
            xIsNext: !xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    toggleDescinding() {
        this.setState({
            historyIsDescinding: !this.state.historyIsDescinding
        });
    }

    render() {
        const step = this.state.stepNumber;
        const history = this.state.history;
        const current = history[step];
        const squares = current.squares;
        const isDescending = this.state.historyIsDescinding;
        const col = current.col;
        const row = current.row;
        const stepNumber = this.state.stepNumber;
        const xIsNext = this.state.xIsNext;

        let moves = [];
        let description;
        for(let index = 0; index < history.length; index++) {
            const className = (index === step) ? "bold" : "";

            if(index) {
                description =
                (`Go to move #${index} (${history[index].row}, ${history[index].col})`);
            } else {
                description = 'Go to game start';
            }

            moves.push(
                <div>
                  <button className={className} onClick={() => this.jumpTo(index)}>
                    {description}
                  </button>
                </div>
            );
        }

        if(isDescending)  {
            moves = moves.reverse();
        }


        let winLine = null
        let winnerObj = calculateWinner(squares, stepNumber)
        if(winnerObj.player){
            // This works because new moves can't be made after a win
            winLine = winnerObj.line;
        }

        let toggleDescription = isDescending ? "List Ascending" : "List Descending";

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                    onClick={(row, col) => this.handleClick(row, col)}
                    winLine={winLine}/>
                </div>
                <div className="game-info">
                    <Status squares={current.squares}
                    stepNumber={stepNumber}
                    xIsNext={xIsNext}/>
                    <button onClick={() => this.toggleDescinding()}>
                        {toggleDescription}
                    </button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

class Board extends React.Component {
    isOnLine(row, col, winLine) {
        if(winLine) {
            for(const [wRow, wCol] of winLine) {
                if ((row === wRow) && (col === wCol)) {
                    return true;
                }
            }
        }
        return false;
    }

    renderSquare(row, col, winLine) {
        const className = this.isOnLine(row, col, winLine) ? "square win" : "square";
        return (<Square
        className={className}
        value={this.props.squares[row][col]}
        onClick={() => this.props.onClick(row, col)}/>);
    }

    render() {
        const width = this.props.squares.length;
        const height = this.props.squares[0].length;
        const winLine = this.props.winLine;

        let row_array = [];
        for(let row = 0; row < width; row++) {
            let squares_array = [];
            for(let col = 0; col < height; col++) {
                squares_array.push(this.renderSquare(row, col, winLine));
            }
            // TODO use inspector to see if I can directly index into a square
            //   and change its properties, instead of looping and searching
            //   for a match
            row_array.push(<div className="board-row">{squares_array}</div>);
        }

        return (
            <div>{row_array}</div>
        );
    }
}


function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick}>
        {props.value}
        </button>
    );
}

function Status(props) {
    let status;
    switch (calculateWinner(props.squares, props.stepNumber).player) {
        case 'X':
            status = 'Winner: X';
            break;
        case 'O':
            status = 'Winner: O';
            break;
        case 'DRAW':
            status = 'Draw';
            break;
        default:
            status = 'Next player: ' + (props.xIsNext ? 'X' : 'O');
            break;
    }

    return (
        <div className="status">{status}</div>
    );
}

function calculateWinner(squares, stepNumber) {
    let result = {player: null, line: null};

    if (stepNumber > 8) {
        result.player = 'DRAW';
    }

    const lines = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],

        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],

        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a[0]][a[1]] &&
            squares[a[0]][a[1]] === squares[b[0]][b[1]] &&
            squares[a[0]][a[1]] === squares[c[0]][c[1]]) {
            result.player = squares[a[0]][a[1]];
            result.line = lines[i]
        }
    }

    return result;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
