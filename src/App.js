import { useState, useReducer, useEffect } from "react";
import "./App.css";

// components imports
import ExpenseForm from "./components/ExpenseForm/ExpenseForm";
import ExpenseInfo from "./components/ExpenseInfo/ExpenseInfo";
import ExpenseList from "./components/ExpenseList/ExpenseList";

// react toasts
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import firebase methods here
import {
  doc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebaseInit";

const reducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case "GET_EXPENSES": {
      return {
        expenses: payload.expenses,
      };
    }
    case "ADD_EXPENSE": {
      return {
        expenses: [payload.expense, ...state.expenses],
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        expenses: state.expenses.filter((expense) => expense.id !== payload.id),
      };
    }
    case "UPDATE_EXPENSE": {
      const expensesDuplicate = state.expenses;
      expensesDuplicate[payload.expensePos] = payload.expense;
      return {
        expenses: expensesDuplicate,
      };
    }
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, { expenses: [] });
  const [expenseToUpdate, setExpenseToUpdate] = useState(null);

  async function getExpenses() {
    const expenseRef = collection(db, "transactions");
    const snapShot = await getDocs(expenseRef);
    const data = snapShot.docs.map((row) => {
      return {
        id: row.id,
        ...row.data(),
      };
    });
    dispatch({
      type: "INITIAL_DATA",
      payload: {
        expenses: data,
      },
    });
  }

  const getData = async () => {
    onSnapshot(collection(db, "transactions"), (snapShot) => {
      const expenses = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dispatch({ type: "GET_EXPENSES", payload: { expenses } });
      toast.success("Expenses retrived successfully.");
    });
  };

  useEffect(() => {
    // getExpenses();
    getData();
  }, []);

  const addExpense = async (expense) => {
    const expenseRef = collection(db, "transactions");
    const docRef = await addDoc(expenseRef, expense);

    // dispatch({
    //   type: "ADD_EXPENSE",
    //   payload: { expense: { id: docRef.id, ...expense } },
    // });
    toast.success("Expense added successfully.");
  };

  const deleteExpense = async (id) => {
    // delete expense from firestore here
    const expenseRef = doc(db, "transactions", id);
    await deleteDoc(expenseRef);

    // dispatch({ type: "REMOVE_EXPENSE", payload: { id } });
    toast.success("Expense deleted successfully.");
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

    const expenseRef = doc(db, "transactions", expense.id);
    // await setDoc(expenseRef, expense);
    await updateDoc(expenseRef, expense);

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
