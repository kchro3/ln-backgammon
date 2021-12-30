const PlayerState = {
  white: 0,
  black: 1,
  empty: 2
}

const Colors = {
  boardBorder: "#663300",
  boardInner: "#B88A00",
  whiteTriangle: "#ADAD85",
  blackTriangle: "#FF471A",
  triangleBorder: "#444",
  blackChecker: "#333",
  whiteChecker: "#DDD",
  cubeBody: "#DDD",
  cubeNumber: "#333",
  buttonBackground: "#FCBD00",
  buttonBorder: "#333",
  buttonText: "#FD3200",
  blackDiceBody: "#333",
  blackDiceDot: "#DDD",
  whiteDiceBody: "#DDD",
  whiteDiceDot: "#333"
}

class BackgammonBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // There are 24 points on a board.
      // A point can have some number of checkers.
      // If there is a nonzero number of checkers, it is either black or white.
      points: new Array(24).fill({
        owner: PlayerState.empty,
        numCheckers: 0,
      }),
      // The player can be white or black.
      // If the player is black, the board is rotated 180 degrees.
      player: PlayerState.white, // PlayerState.black
    };
  }

  componentDidMount() {
    this.drawEmptyBoard();
  }

  drawEmptyBoard() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");

    const width = this.props.width;
    const height = this.props.width * 0.75;
    const p = 0.02 // pitches?

    // Set up basic canvas params.
    canvas.width = width;
    canvas.height = height;
    ctx.save();
    ctx.fillStyle = Colors.boardBorder;
    ctx.fillRect(0, 0, width, height);
    ctx.fillRect(width * p, height * p * 2, width * p * 3, height * p * 20);      // top left holder
    ctx.fillRect(width * p, height * p * 28, width * p * 3, height * p * 20);     // bottom left holder
    ctx.fillRect(width * p * 46, height * p * 2, width * p * 3, height * p * 20);   // top right holder
    ctx.fillRect(width * p * 46, height * p * 28, width * p * 3, height * p * 20);  // bottom right holder
    ctx.fillRect(width * p * 5, height * p * 2, width * p * 18, height * p * 46);   // left board
    ctx.fillRect(width * p * 27, height * p * 2, width * p * 18, height * p * 46);  // right board

    // draw the 24 points
    for (var i = 0; i < 6; i++) {
      // NOTE: how to invert if player is black?
      const colorPlayer = i % 2 ? Colors.whiteTriangle : Colors.blackTriangle;
      const colorOpponent = ((i + 1) % 2) ? Colors.whiteTriangle : Colors.blackTriangle;

      this.drawPoint(ctx, width, height, p, 5 + i * 3, 2, 3, 20, colorPlayer);      // top left points
      this.drawPoint(ctx, width, height, p, 5 + i * 3, 48, 3, 20, colorOpponent);   // bottom left points
      this.drawPoint(ctx, width, height, p, 27 + i * 3, 2, 3, 20, colorPlayer);     // top right points
      this.drawPoint(ctx, width, height, p, 27 + i * 3, 48, 3, 20, colorOpponent);  // bottom right points
    }

    ctx.restore();
  }

  drawPoint(ctx, width, height, p, startX, startY, triangleWidth, triangleHeight, triangleColor) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(width * p * startX, height * p * startY);

    var peak = startY < 25 ? startY + triangleHeight : startY - triangleHeight;
    ctx.lineTo(width * p * (startX + triangleWidth / 2), height * p * peak);
    ctx.lineTo(width * p * (startX + triangleWidth), height * p * startY);
    ctx.fillStyle = triangleColor;
    ctx.strokeStyle = Colors.triangleBorder;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  render() {
    return <canvas ref="canvas" />;
  }
}

function App() {
  const { Container, Row, Col } = ReactBootstrap;
  return (
    <Container>
      <Row>
        <Col md={{ offset: 3, span: 6 }}>
          <BackgammonBoard width={640} />
        </Col>
      </Row>
    </Container>
  );
}

function TodoListCard() {
  const [items, setItems] = React.useState(null);

  React.useEffect(() => {
    fetch('/items')
      .then(r => r.json())
      .then(setItems);
  }, []);

  const onNewItem = React.useCallback(
    newItem => {
      setItems([...items, newItem]);
    },
    [items],
  );

  const onItemUpdate = React.useCallback(
    item => {
      const index = items.findIndex(i => i.id === item.id);
      setItems([
        ...items.slice(0, index),
        item,
        ...items.slice(index + 1),
      ]);
    },
    [items],
  );

  const onItemRemoval = React.useCallback(
    item => {
      const index = items.findIndex(i => i.id === item.id);
      setItems([...items.slice(0, index), ...items.slice(index + 1)]);
    },
    [items],
  );

  if (items === null) return 'Loading...';

  return (
    <React.Fragment>
      <AddItemForm onNewItem={onNewItem} />
      {items.length === 0 && (
        <p className="text-center">You have no todo items yet! Add one above!</p>
      )}
      {items.map(item => (
        <ItemDisplay
          item={item}
          key={item.id}
          onItemUpdate={onItemUpdate}
          onItemRemoval={onItemRemoval}
        />
      ))}
    </React.Fragment>
  );
}

function AddItemForm({ onNewItem }) {
  const { Form, InputGroup, Button } = ReactBootstrap;

  const [newItem, setNewItem] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submitNewItem = e => {
    e.preventDefault();
    setSubmitting(true);
    fetch('/items', {
      method: 'POST',
      body: JSON.stringify({ name: newItem }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.json())
      .then(item => {
        onNewItem(item);
        setSubmitting(false);
        setNewItem('');
      });
  };

  return (
    <Form onSubmit={submitNewItem}>
      <InputGroup className="mb-3">
        <Form.Control
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          type="text"
          placeholder="New Item"
          aria-describedby="basic-addon1"
        />
        <InputGroup.Append>
          <Button
            type="submit"
            variant="success"
            disabled={!newItem.length}
            className={submitting ? 'disabled' : ''}
          >
            {submitting ? 'Adding...' : 'Add Item'}
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
  const { Container, Row, Col, Button } = ReactBootstrap;

  const toggleCompletion = () => {
    fetch(`/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: item.name,
        completed: !item.completed,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.json())
      .then(onItemUpdate);
  };

  const removeItem = () => {
    fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
      onItemRemoval(item),
    );
  };

  return (
    <Container fluid className={`item ${item.completed && 'completed'}`}>
      <Row>
        <Col xs={1} className="text-center">
          <Button
            className="toggles"
            size="sm"
            variant="link"
            onClick={toggleCompletion}
            aria-label={
              item.completed
                ? 'Mark item as incomplete'
                : 'Mark item as complete'
            }
          >
            <i
              className={`far ${item.completed ? 'fa-check-square' : 'fa-square'
                }`}
            />
          </Button>
        </Col>
        <Col xs={10} className="name">
          {item.name}
        </Col>
        <Col xs={1} className="text-center remove">
          <Button
            size="sm"
            variant="link"
            onClick={removeItem}
            aria-label="Remove Item"
          >
            <i className="fa fa-trash text-danger" />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
