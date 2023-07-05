import { useState, useReducer, useEffect } from "react";
import "./App.css";
import { db } from "./firebaseInit";
import { addDoc, collection, doc, getDocs, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";

// components imports
import ExpenseForm from "./components/ExpenseForm/ExpenseForm";
import ExpenseInfo from "./components/ExpenseInfo/ExpenseInfo";
import ExpenseList from "./components/ExpenseList/ExpenseList";

// react toasts
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import firebase methods here

const reducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case "ADD_EXPENSE": {
      return {
        expenses: [payload.expense, ...state.expenses]
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        expenses: state.expenses.filter((expense) => expense.id !== payload.id)
      };
    }
    case "UPDATE_EXPENSE": {
      const expensesDuplicate = state.expenses;
      expensesDuplicate[payload.expensePos] = payload.expense;
      return {
        expenses: expensesDuplicate
      };
    }
    case "INITIAL_DATA": {
      return {
        expenses: payload.expenses,
      };
    }
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, { expenses: [] });
  const [expenseToUpdate, setExpenseToUpdate] = useState(null);

  // create function to get expenses from firestore here
  async function getExpenses() {
    const expenseRef = collection(db, "transactions");
    const snapShot = await getDocs(expenseRef);
    const data = snapShot.docs.map((row) => {
      return {
        id: row.id,
        ...row.data(),
      };
    })
    dispatch({
      type: "INITIAL_DATA",
      payload: {
        expenses: data,
      },
    });
  }
  // use appropriate hook to get the expenses when app mounts
  useEffect(() => {
    // getExpenses();
    const expenseRef = collection(db, "transactions");
    const unsub = onSnapshot(expenseRef, (snapShot) => {
      const data = snapShot.docs.map((row) => {
        return {
          id: row.id,
          ...row.data(),
        };
      })
      dispatch({
        type: "INITIAL_DATA",
        payload: {
          expenses: data,
        },
      });
    });
  },[]);

  const addExpense = async (expense) => {
    // add expense to firestore here
    let docRef = collection(db,"transactions");
    let doc = await addDoc(docRef, expense)

    // dispatch({
    //   type: "ADD_EXPENSE",
    //   // add the new document id to the payload expense object below
    //   payload: { expense: { id: doc.id,...expense } }
    // });
    toast.success("Expense added successfully.");
  };

  const deleteExpense = async (id) => {
    const expenseRef = doc(db, "transactions", id);
    await deleteDoc(expenseRef);
    // dispatch({ type: "REMOVE_EXPENSE", payload: { id } });
  };

  const resetExpenseToUpdate = () => {
    setExpenseToUpdate(null);
  };

  const updateExpense = async (expense) => {
    const expensePos = state.expenses
      .map(function (exp) {
        return exp.id;
      })
      .indexOf(expense.id);

    if (expensePos === -1) {
      return false;
    }

    // update expense in firestore here
    let docRef = doc(db,"transactions",expense.id);
    await setDoc(docRef, expense);

    // dispatch({ type: "UPDATE_EXPENSE", payload: { expensePos, expense } });
    toast.success("Expense updated successfully.");
  };

  return (
    <>
      <ToastContainer />
      <h2 className="mainHeading">Expense Tracker</h2>
      <div className="App">
        <ExpenseForm
          addExpense={addExpense}
          expenseToUpdate={expenseToUpdate}
          updateExpense={updateExpense}
          resetExpenseToUpdate={resetExpenseToUpdate}
        />
        <div className="expenseContainer">
          <ExpenseInfo expenses={state.expenses} />
          <ExpenseList
            expenses={state.expenses}
            deleteExpense={deleteExpense}
            changeExpenseToUpdate={setExpenseToUpdate}
          />
        </div>
      </div>
    </>
  );
}

export default App;
