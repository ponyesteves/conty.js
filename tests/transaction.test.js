import { createTransaction, createItem, addItem, addItems, removeItem, updateItem, validateTransaction, generateSaveTransaction } from '../src'
import R from 'ramda'

describe('addItem to transaction', () => {
  it('adds item to empty transaction', () => {
    expect(R.pick(['accountId', 'amount'], addItem({ accountId: 'bankYYY', amount: 1 }, createTransaction()).items[0])).toEqual({ accountId: 'bankYYY', amount: 1 })
  })
})

describe('addItems to transaction', () => {
  it('adds items to empty transaction', () => {
    expect(R.pick(['accountId', 'amount'], addItems([{ accountId: 'bankYYY', amount: 1 }],createTransaction()).items[0])).toEqual({ accountId: 'bankYYY', amount: 1 })
  })
})

describe('it validates transactions', () => {
  it('adds error if amount not zero', () => {
    expect(
      addItems([{ accountId: 'bankYYY', amount: 1 }], createTransaction())
        .errors.join(''))
      .toMatch('zero')
  })

  it('has no error if amount not zero', () => {
    expect(
      addItems([{ accountId: 'bankYYY', amount: 1, dueDate: new Date() }, { accountId: 'bankZZZ', amount: -1, dueDate: new Date() }],createTransaction())
        .errors)
      .toEqual([])
  })

})


describe('it removes item from transactions', () => {
  it('add two item', () => {
    expect(
      addItems([
        { accountId: 'bankYYY', amount: 1 },
        { accountId: 'bankZZZ', amount: -1 }
      ],createTransaction()).items.length
    ).toEqual(2)
  })
  it('add two item', () => {
    const item1 = createItem({ accountId: 'bankYYY', amount: 1, dueDate: '2017-02-02' }),
      item2 = createItem({ accountId: 'bankZZZ', amount: -1, dueDate: '2017-02-02' }),
      transaction = addItems([item1, item2],createTransaction())
    expect(removeItem(item1._id, transaction).items.length).toEqual(1)
    expect(R.pipe(removeItem(item2._id), removeItem(item1._id))(transaction).items.length).toEqual(0)
  })
  it('update item', () => {
    const item1 = createItem({ accountId: 'bankYYY', amount: 1, dueDate: '2017-02-02'  }),
      item2 = createItem({ accountId: 'bankZZZ', amount: -3, dueDate: '2017-02-02'  }),
      transaction = addItems([item1, item2],createTransaction())
    expect(transaction.errors.join('')).toMatch('zero')
    const updatedTransaction = updateItem({ ...item2, amount: -1 }, transaction)
    expect(updatedTransaction.errors.join('')).not.toMatch('zero')
    expect(updatedTransaction.items.length).toEqual(2)
  })
})
describe('generate Save transaction', () => {
  const item1 = createItem({ accountId: 'bankYYY', amount: 1, dueDate: new Date() }),
  item2 = createItem({ accountId: 'bankZZZ', amount: -3, dueDate: new Date() }),
  item3 = createItem({ accountId: 'bankZZZ', amount: -1, dueDate: new Date() }),
  mySaveTransactionFx = generateSaveTransaction((transaction) => {
    return true
  })
  it('throw error if transacion has errors', () => {
    expect(() => mySaveTransactionFx(addItems([item1, item2])))
    .toThrow()
  })
  it('doesnt throw error if transacion has no errors', () => {
    expect(() => mySaveTransactionFx(addItems([item1, item3],createTransaction())))
    .not.toThrow()
  })
  it('doesnt throw error if transacion is corrected before saving', () => {
    expect(() => mySaveTransactionFx(updateItem({ ...item2, amount: -1 }, addItems([item1, item2],createTransaction()))))
    .not.toThrow()
  })
})