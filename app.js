const budgetController = (function () {
  // Function Constructors
  const Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  const Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  const calculateTotal = function (type) {
    let sum = 0
    data.allItems[type].forEach((current) => {
      sum = sum + current.value
    })
    data.totals[type] = sum
  }

  // Data structure
  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  }

  return {
    addItem: (type, description, value) => {
      let newItem, ID

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1
      } else {
        ID = 0
      }

      // Create new item based on type
      if (type === 'exp') {
        newItem = new Expense(ID, description, value)
      } else if (type === 'inc') {
        newItem = new Income(ID, description, value)
      }

      // Push it into data structure
      data.allItems[type].push(newItem)

      // Return new element
      return newItem
    },

    deleteItem: (type, id) => {
      let ids, index

      ids = data.allItems[type].map((current) => current.id)

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: () => {
      // 1. calculate total inc and exp
      calculateTotal('exp')
      calculateTotal('inc')

      // 2. calculate the budget: inc - exp
      data.budget = data.totals.inc - data.totals.exp

      // 3. calculate the % of the inc that we spent
      if (data.totals.inc > 0) {
        data.percentage = (data.totals.exp / data.totals.inc) * 100
      } else {
        data.percentage = -1
      }
    },

    calculatePercentages: () => {
      data.allItems.exp.forEach((element) => {
        element.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: () => {
      const allPercentages = data.allItems.exp.map((element) => {
        return element.getPercentage()
      })
      return allPercentages
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      }
    },

    // Tester
    testing: () => {
      console.log(data)
    },
  }
})()

const UIController = (function () {
  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  }

  const formatNumber = function (num, type) {
    let numSplit, dec, int
    num = Math.abs(num)
    num = num.toFixed(2)
    numSplit = num.split('.')
    int = parseInt(numSplit[0])
    dec = numSplit[1]
    int = int.toLocaleString()

    return (type === 'exp' ? '-' : '+') + int + '.' + dec
  }

  const nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  }

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      }
    },
    addListItem: (obj, type) => {
      let html, newHtml, element
      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer

        html = `<div class="item clearfix" id="inc-%id%">
          <div class="item__description">%description%</div>
          <div class="right clearfix">
              <div class="item__value">%value%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer

        html = `<div class="item clearfix" id="exp-%id%">
          <div class="item__description">%description%</div>
          <div class="right clearfix">
              <div class="item__value">%value%</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id)
      newHtml = newHtml.replace('%description%', obj.description)
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))
      // Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
    },

    deleteListItem: (itemID) => {
      document.getElementById(itemID).remove()
    },

    clearFields: () => {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      )

      const fieldsArr = Array.prototype.slice.call(fields)

      fieldsArr.forEach((element) => {
        element.value = ''
      })

      fieldsArr[0].focus()
    },

    displayBudget: (obj) => {
      obj.budget > 0 ? (type = 'inc') : (type = 'exp')

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        'inc'
      )
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'exp'
      )
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, type)

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%'
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }
    },

    displayPercentages: (percentages) => {
      const fields = document.querySelectorAll(
        DOMstrings.expensesPercentageLabel
      )

      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%'
        } else {
          current.textContent = '---'
        }
      })
    },

    displayDate: () => {
      let now = new Date()

      let currentMonth = now.getMonth()
      let months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]

      let year = now.getFullYear()
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[currentMonth] + ' ' + year
    },

    typeChange: () => {
      let fields = document.querySelectorAll(
        `${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`
      )

      nodeListForEach(fields, (current) => {
        current.classList.toggle('red-focus')
      })

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
    },

    getDOMstrings: () => {
      return DOMstrings
    },
  }
})()

const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMstrings()

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

    document.addEventListener('keypress', (event) => {
      if (event.code === 'Enter') {
        ctrlAddItem()
      }
    })

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem)

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.typeChange)
  }

  const updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget()

    // 2. Return the budget
    const budget = budgetCtrl.getBudget()

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget)
  }

  const updatePercentages = () => {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages()

    // 2. Read percentages from the budget controller
    const percentages = budgetCtrl.getPercentages()

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages)
  }

  const ctrlAddItem = () => {
    // 1. Get the field input data
    const input = UICtrl.getInput()
    //console.log('ctrlAddItem input', input)

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      )
      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type)

      // 4. Clear fields
      UICtrl.clearFields()

      // 5. Calculate and update budget
      updateBudget()

      // 6. Calculate and update percentages
      updatePercentages()
    }
  }

  const ctrlDeleteItem = (event) => {
    let itemID, splitID, type, ID

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
      // Get data type and ID
      splitID = itemID.split('-')
      type = splitID[0]
      ID = parseInt(splitID[1])

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // 2. Delte the item from the UI
      UICtrl.deleteListItem(itemID)

      // 3. Update and show the new budget
      updateBudget()

      // 4. Calculate and update percentages
      updatePercentages()
    }
  }

  return {
    init: () => {
      console.log('init')
      UICtrl.displayDate()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      })
      setupEventListeners()
    },
  }
})(budgetController, UIController)

controller.init()
