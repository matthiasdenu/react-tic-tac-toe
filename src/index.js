
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

        if (calculateWinner(squares) || squares[row][col]) {
            return;
        }

        squares[row][col] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
                row: row,
                col: col
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
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

        if(this.state.historyIsDescinding)  {
            moves = moves.reverse();
        }

        let winMove = [null, null];
        if(calculateWinner(squares) &&
             (calculateWinner(squares) !== null) &&
               (calculateWinner(squares) !== 'DRAW')) {
            // this works because new moves can't be made after a win
            winMove = [current.row, current.col];
        }

        let toggleDescription = isDescending ? "List Ascending" : "List Descending";

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                    onClick={(row, col) => this.handleClick(row, col)}
                    winMove={winMove}/>
                </div>
                <div className="game-info">
                    <Status squares={current.squares}
                    stepNumber={this.state.stepNumber}
                    xIsNext={this.state.xIsNext}/>
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
    renderSquare(row, col) {
        let [winRow, winCol] = this.props.winMove;
        let className = ((winRow == row) && (winCol == col)) ? "square win" : "square";
        return (<Square
        className={className}
        value={this.props.squares[row][col]}
        onClick={() => this.props.onClick(row, col)}/>);
    }

    render() {
        const width = this.props.squares.length;
        const height = this.props.squares[0].length;

        let row_array = [];
        for(let row = 0; row < width; row++) {
            let squares_array = [];
            for(let col = 0; col < height; col++) {
                squares_array.push(this.renderSquare(row, col));
            }
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
    switch (calculateWinner(props.squares, props.stepNumber)) {
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
    let result = null;

    if (stepNumber > 8) {
        result = 'DRAW';
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
            result = squares[a[0]][a[1]];
        }
    }

    return result;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
