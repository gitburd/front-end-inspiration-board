import React, { useState, useEffect } from 'react';
import './App.css';
import BoardList from './components/BoardList';
import CardList from './components/CardList';
import NewBoard from './components/NewBoard';
import axios from 'axios';


function App() {
  const apiUrl = "https://space-panda-inspiration-board.herokuapp.com"
  const [state, setState] = useState({
    boards: [],
    cards: [],
    currentBoard: {}
  })

  const [reload, setReload] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const boards = await getBoards()
      const cards = await getCards(boards[0].id)

      const newState = { ...state }
      newState.cards = cards
      newState.boards = boards
      newState.currentBoard = boards[0]
      setState(newState)
    }
    fetchData();
    // eslint-disable-next-line
  }, [reload])

  const getBoards = async () => {
    return axios.get(`${apiUrl}/boards`)
      .then((res) => {
        return res.data[0]
      })
      .catch((e) => {
        console.log('error!', e);
      });
  }

  const onBoardClick = async (board) => {
    const newState = { ...state }
    let cards = await getCards(board.id)
    newState.currentBoard = board
    newState.cards = cards
    setState(newState)
  }

  const getCards = (id) => {
    return axios.get(`${apiUrl}/boards/${id}/cards`)
      .then((res) => {
        return res.data.tasks
      })
      .catch((e) => {
        console.log('error!', e);
      });
  }

  const createBoard = (board) => {
    axios.post(`${apiUrl}/boards`, {
      owner: board.owner,
      title: board.title
    })
      .then(() => {
        setReload(true)
        setReload(false)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const createCard = async (card) => {
    card.board_id = state.currentBoard.id
    card.likes_count = 0
    axios.post(`${apiUrl}/cards`, card)
      .then(() => {
        return getCards(state.currentBoard.id)
      })
      .then((cards) => {
        const newState = { ...state }
        newState.cards = cards
        setState(newState)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const deleteCard = (id) => {
    axios.delete(`${apiUrl}/cards/${id}`)
      .then(() => {
        return getCards(state.currentBoard.id)
      })
      .then((cards) => {
        const newState = { ...state }
        newState.cards = cards
        setState(newState)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const likeCard = (card) => {
    card.likes_count++
    axios.put(`${apiUrl}/cards/${card.id}`, card)
      .then(() => {
        const newState = { ...state }
        for (let i = 0; i < newState.cards.length; i++) {
          let c = newState.cards[i]
          if (c.card_id === card.id) {
            c.likes_count++
          }
        }
        setState(newState)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div className="App">
      <header><h1>Inspiration Board</h1></header>
      <main>
        <div className="boards">
          <BoardList boards={state.boards} onBoardClick={onBoardClick} currentBoard={state.currentBoard} />
          <div>
            <img src='https://i0.wp.com/thumbs.gfycat.com/GreedyRightCrustacean-max-1mb.gif' alt="panda" />
            {state.currentBoard && state.currentBoard.title ? <h2>{state.currentBoard.title}</h2> : ''}
          </div>
          <NewBoard createBoard={createBoard} />
        </div>
        <CardList createCard={createCard} cards={state.cards} deleteCard={deleteCard} likeCard={likeCard} />
      </main>
    </div>
  );
}

export default App;
