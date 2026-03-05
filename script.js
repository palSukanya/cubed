(function(){

  const boardEl   = document.getElementById('board');
  const statusEl  = document.getElementById('status');
  const resetBtn  = document.getElementById('reset');
  const modeEl    = document.getElementById('mode');
  const turnBar   = document.getElementById('turn-bar');
  const scoreXEl  = document.getElementById('score-x');
  const scoreOEl  = document.getElementById('score-o');
  const xCard     = document.getElementById('x-card');
  const oCard     = document.getElementById('o-card');
  const xNameEl   = document.getElementById('x-name');
  const oNameEl   = document.getElementById('o-name');

  const human = 'X', ai = 'O';
  let board, currentPlayer, gameActive, scores = { X: 0, O: 0 };
  let cubes = [];

  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // Build grid
  function buildBoard() {
    boardEl.innerHTML = '';
    cubes = [];
    for (let i = 0; i < 9; i++) {
      const cube = document.createElement('div');
      cube.className = 'cube';
      cube.dataset.index = i;
      cube.innerHTML = '<div class="face front"></div><div class="face back"></div>';
      cube.addEventListener('click', onCubeClick);
      boardEl.appendChild(cube);
      cubes.push(cube);
    }
  }

  function initGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    buildBoard();
    updateUI();
    updateNames();
  }

  function updateNames() {
    const mode = modeEl.value;
    xNameEl.textContent = 'X';
    oNameEl.textContent = mode === '2p' ? 'O' : 'AI';
  }

  function updateUI() {
    // Turn bar
    turnBar.className = 'turn-bar-fill' + (currentPlayer === 'O' ? ' o-turn' : '');

    // Score cards
    xCard.classList.toggle('active-card', currentPlayer === 'X' && gameActive);
    oCard.classList.toggle('active-card', currentPlayer === 'O' && gameActive);

    // Status
    statusEl.className = currentPlayer === 'X' ? 'x-turn' : 'o-turn';
    const isAI = modeEl.value !== '2p' && currentPlayer === ai;
    statusEl.textContent = isAI
      ? 'AI is thinking…'
      : `${currentPlayer} — Your Turn`;

    // Force re-animation
    statusEl.style.animation = 'none';
    statusEl.offsetHeight;
    statusEl.style.animation = '';
  }

  function onCubeClick() {
    const idx = +this.dataset.index;
    if (board[idx] !== '' || !gameActive) return;
    if (modeEl.value !== '2p' && currentPlayer === ai) return;
    makeMove(idx, currentPlayer);
    if (gameActive) nextTurn();
  }

  function makeMove(idx, player) {
    board[idx] = player;
    const cube = cubes[idx];
    cube.dataset.player = player;
    cube.querySelector('.back').textContent = player;
    cube.classList.add('flipped');
    checkWinner();
  }

  function nextTurn() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateUI();
    if (modeEl.value !== '2p' && currentPlayer === ai && gameActive) {
      setTimeout(aiMove, 480);
    }
  }

  function aiMove() {
    if (!gameActive) return;
    const mode = modeEl.value;
    let move;
    if (mode === 'easy')        move = randomMove();
    else if (mode === 'medium') move = Math.random() < 0.5 ? randomMove() : bestMove();
    else                        move = bestMove();
    makeMove(move, ai);
    if (gameActive) nextTurn();
  }

  function randomMove() {
    const empty = board.map((v,i) => v===''?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function bestMove() {
    let bestScore = -Infinity, move;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = ai;
        const score = minimax(board, false);
        board[i] = '';
        if (score > bestScore) { bestScore = score; move = i; }
      }
    }
    return move;
  }

  function minimax(b, isMax) {
    const r = evaluateStatic();
    if (r !== null) return r;
    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === '') { b[i] = ai; best = Math.max(best, minimax(b, false)); b[i] = ''; }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === '') { b[i] = human; best = Math.min(best, minimax(b, true)); b[i] = ''; }
      }
      return best;
    }
  }

  function evaluateStatic() {
    for (const [a,b,c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === ai ? 10 : -10;
      }
    }
    if (!board.includes('')) return 0;
    return null;
  }

  function checkWinner() {
    for (const [a,b,c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        const winner = board[a];
        gameActive = false;
        [a,b,c].forEach(i => cubes[i].classList.add('win'));
        scores[winner]++;
        scoreXEl.textContent = scores.X;
        scoreOEl.textContent = scores.O;

        const mode = modeEl.value;
        const winnerLabel = (mode !== '2p' && winner === ai) ? 'AI' : winner;
        statusEl.textContent = `${winnerLabel} Wins 🏆`;
        statusEl.className = 'win';
        statusEl.style.animation = 'none';
        statusEl.offsetHeight;
        statusEl.style.animation = '';

        // Highlight winning score card
        xCard.classList.remove('active-card');
        oCard.classList.remove('active-card');
        if (winner === 'X') xCard.classList.add('active-card');
        else oCard.classList.add('active-card');

        return;
      }
    }
    if (!board.includes('')) {
      gameActive = false;
      statusEl.textContent = 'Draw — Well Played';
      statusEl.className = 'draw';
      statusEl.style.animation = 'none';
      statusEl.offsetHeight;
      statusEl.style.animation = '';
    }
  }

  modeEl.addEventListener('change', () => { updateNames(); initGame(); });
  resetBtn.addEventListener('click', initGame);

  initGame();

})();