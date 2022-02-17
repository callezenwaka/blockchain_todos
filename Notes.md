### Compile smart contract
```
truffle compile
```

### migrate smart contract
```
truffle migrate --reset
```

### explore smart contract
```
truffle console
```

### test smart contract
```
truffle test
```

### start smart contract in dev env
```
npm run dev
```

function mainEnter() {
  web3.eth.getAccounts(function (error, result) {
    web3.eth.sendTransaction({
      from: web3.eth.accounts[0],
      to: "0x943",
      value: "1000000000000000000",
      data: "0xdf"
    }, function (err, transactionHash) {
      if (!err)
        console.log(transactionHash + " success");
    });
  });
}

await App.todoList.createTask(content, {from: App.account})
await App.todoList.createTask(content, { from: App.account })
await App.todoList.createTask(content,  { from:  web3.eth.defaultAccount}) 