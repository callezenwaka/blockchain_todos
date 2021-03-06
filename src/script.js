App = {

  loading: false,

  contracts: {},

  load: async () => {
    // load app...
    console.log("app loading. . . ");
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      // App.web3Provider = web3.currentProvider
      // web3 = new Web3(web3.currentProvider)

      // let web3 = new Web3('ws://localhost:8546');
      App.web3Provider = Web3.givenProvider;
      web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider('http://localhost:8545'));
      // console.log(web3)
      // web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      // App.web3Provider = web3.setProvider('HTTP://127.0.0.1:8545');
      // web3 = new Web3('HTTP://127.0.0.1:8545');

      // web3.setProvider('ws://localhost:8546');
      // web3.setProvider(new Web3.providers.WebsocketProvider('ws://localhost:8546'));
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        // await ethereum.enable()
        await window.ethereum.request({method: `eth_requestAccounts`});
        // await ethereum.request({ method: 'eth_accounts' });
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */});
        // web3.eth.sendTransaction({
        //   from: web3.eth.accounts[0],
        //   to: "0x943",
        //   value: "1000000000000000000",
        //   data: "0xdf"
        // })
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
      // await ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [
      //     {
      //       to: '0x...',
      //       'from': '0x...',
      //       value: '0x...',
      //       // And so on...
      //     },
      //   ],
      // });
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    // App.account = web3.eth.accounts[0];
    // console.log(web3.eth.accounts[0])
    let accounts = await web3.eth.getAccounts();
    App.account = accounts[0];
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json');
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(App.web3Provider);

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) return;

    // Update app loading state
    App.setLoading(true);

    // Render Account
    $('#account').html(App.account);

    // Render Tasks
    await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $('#newTask').val();
    // await App.todoList.createTask(content);
    // await App.todoList.createTask(content, { from: web3.eth.defaultAccount });
    await App.todoList.createTask(content, { from: App.account });
    window.location.reload();
  },

  toggleCompleted: async (e) => {
    App.setLoading(true);
    const taskId = e.target.name;
    await App.todoList.toggleCompleted(taskId, { from: App.account });
    window.location.reload();
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load();
  });
});