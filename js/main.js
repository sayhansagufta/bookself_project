const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKS_SELF";
let isEditing = false;
let editingBookId = null;

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  if (submitForm) {
    submitForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isEditing) {
        updateBook(editingBookId);
      } else {
        addBook();
      }
    });
  } else {
    console.error("Form element not found");
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser not Supported Local Storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      book.year = parseInt(book.year, 10);
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value, 10);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const booksObject = generateBooksObject(generatedID, title, author, year, isComplete);
  books.push(booksObject);

  clearForm();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBooksObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
  const unCompleted = document.querySelector('[data-testid="incompleteBookList"]');
  unCompleted.innerHTML = "";

  const Completed = document.querySelector('[data-testid="completeBookList"]');
  Completed.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makebooks(bookItem);
    if (!bookItem.isComplete) {
      unCompleted.append(bookElement);
    } else {
      Completed.append(bookElement);
    }
  }
});

function makebooks(booksObject) {
  const bookContainer = document.createElement("div");
  bookContainer.setAttribute("data-bookid", booksObject.id);
  bookContainer.setAttribute("data-testid", "bookItem");

  const bookTitle = document.createElement("h3");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.innerText = booksObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookAuthor.innerText = booksObject.author;

  const bookYear = document.createElement("p");
  bookYear.setAttribute("data-testid", "bookItemYear");
  bookYear.innerText = booksObject.year;

  const buttonsContainer = document.createElement("div");

  // Append buttons to the container
  //buttonsContainer.append(completeButton, deleteButton, editButton);

  // Append the elements to the book container
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  if (booksObject.isComplete) {
    const editButton = document.createElement("button");
    editButton.classList.add("edit_btn");
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.innerHTML = '<i class="bi bi-pencil-fill" style="margin-right: 8px"></i>Edit Buku';
    editButton.style.visibility = "visible";

    editButton.addEventListener("click", function () {
      EditButtonBooks(booksObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deleted_btn");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.innerHTML = '<i class="bi bi-trash3-fill" style="margin-right: 8px"></i>Hapus Buku';
    deleteButton.style.visibility = "visible";

    deleteButton.addEventListener("click", function () {
      deleteButtonBooks(booksObject.id);
    });

    const undoButton = document.createElement("button");
    undoButton.classList.add("undo_btn");
    undoButton.setAttribute("data-testid", "bookItemUndoButton");
    undoButton.innerHTML = '<i class="bi bi-arrow-clockwise" style="margin-right: 8px"></i>Belum Dibaca';
    undoButton.style.visibility = "visible";

    undoButton.addEventListener("click", function () {
      undoButtonBooks(booksObject.id);
    });

    bookContainer.append(editButton, deleteButton, undoButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("completed_btn");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.innerHTML = '<i class="bi bi-check-lg" style="margin-right: 8px"></i>Selesai dibaca';
    completeButton.style.visibility = "visible";

    completeButton.addEventListener("click", function () {
      completeButtonBooks(booksObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deleted_btn");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.innerHTML = '<i class="bi bi-trash3-fill" style="margin-right: 8px"></i>Hapus Buku';
    deleteButton.style.visibility = "visible";

    deleteButton.addEventListener("click", function () {
      deleteButtonBooks(booksObject.id);
    });
    bookContainer.append(completeButton, deleteButton);
  }

  return bookContainer;
}

function EditButtonBooks(booksId) {
  const bookToEdit = findBooks(booksId);

  if (!bookToEdit) return;

  document.getElementById("bookFormTitle").value = bookToEdit.title;
  document.getElementById("bookFormAuthor").value = bookToEdit.author;
  document.getElementById("bookFormYear").value = bookToEdit.year;
  document.getElementById("bookFormIsComplete").checked = bookToEdit.isComplete;

  isEditing = true;
  editingBookId = booksId;
}

function updateBook(booksId) {
  const bookTarget = findBooks(booksId);

  if (!bookTarget) return;

  bookTarget.title = document.getElementById("bookFormTitle").value;
  bookTarget.author = document.getElementById("bookFormAuthor").value;
  bookTarget.year = parseInt(document.getElementById("bookFormYear").value, 10);
  bookTarget.isComplete = document.getElementById("bookFormIsComplete").checked;

  clearForm();
  isEditing = false;
  editingBookId = null;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function clearForm() {
  document.getElementById("bookFormTitle").value = "";
  document.getElementById("bookFormAuthor").value = "";
  document.getElementById("bookFormYear").value = "";
  document.getElementById("bookFormIsComplete").checked = false;
}

function completeButtonBooks(booksId) {
  const booksTarget = findBooks(booksId);

  if (booksTarget == null) return;

  booksTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteButtonBooks(booksId) {
  const booksTarget = findBooksIndex(booksId);

  if (booksTarget === -1) return;

  books.splice(booksTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBooksIndex(booksId) {
  for (const index in books) {
    if (books[index].id === booksId) {
      return index;
    }
  }
  return -1;
}

function findBooks(booksId) {
  for (const booksItem of books) {
    if (booksItem.id === booksId) {
      return booksItem;
    }
  }
  return null;
}

document.getElementById("searchBook").addEventListener("submit", function (event) {
  event.preventDefault();
  const searchInput = document.getElementById("searchBookTitle").value.toLowerCase();
  searchBooks(searchInput);
});

function searchBooks(query) {
  const unCompleted = document.querySelector('[data-testid="incompleteBookList"]');
  const Completed = document.querySelector('[data-testid="completeBookList"]');

  unCompleted.innerHTML = "";
  Completed.innerHTML = "";

  for (const bookItem of books) {
    if (bookItem.title.toLowerCase().includes(query)) {
      const bookElement = makebooks(bookItem);
      if (!bookItem.isComplete) {
        unCompleted.append(bookElement);
      } else {
        Completed.append(bookElement);
      }
    }
  }
}

function undoButtonBooks(booksId) {
  const booksTarget = findBooks(booksId);

  if (booksTarget == null) return;

  booksTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
