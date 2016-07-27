'use strict';

function getCountedIds(ids) {
  return ids.map((element)=> {
    let [id, count] = element.split(' x ');
    return {
      id,
      count: parseInt(count)
    }
  });
}

function getBuyedItems(countedIds, allItems) {
  return countedIds.map(({id, count}) => {
    let {name, price} = allItems.find(x => x.id === id);

    return {id, name, price, count};
  })
}

function getPromotionItems(buyedItems, promotions) {
  let currentPromotion = promotions[1];
  let items = currentPromotion.items;
  return buyedItems.map(({id, name, price, count})=> {
    let item = items.find(x=> x === id);
    if (item === undefined) {
      return {id, name, price, count};
    } else {
      return {id, name, price, count, type: currentPromotion.type};
    }
  })
}

function calculatePromotedItems(promotionItems) {
  return promotionItems.map(({id, name, price, count, type})=> {
    let payPrice = price * count;
    if (type === '指定菜品半价') {
      return {id, name, price, count, type, payPrice, saved: price * 0.5}
    } else {
      return {id, name, price, count, payPrice, saved: 0}
    }
  })
}

function getTotalPrices(itemPrices) {
  let {totalPayPrice, totalSaved} = itemPrices.reduce((result, {payPrice, saved})=> {
    result.totalPayPrice += payPrice;
    result.totalSaved += saved;
    return result;
  }, {totalPayPrice: 0, totalSaved: 0});

  if (totalPayPrice > 30 && totalSaved <= 6) {
    totalSaved = 6;
  }

  return {
    totalSaved,
    totalPrice: totalPayPrice - totalSaved
  }
}

function buildReceipts(itemPrices, totalPrices) {
  let items = itemPrices.map(({name, count, type, payPrice})=> {
    return {name, count, type, payPrice};
  })
  return {
    items,
    totalPrices
  }
}

function buildReceiptString(receipts) {
  let lines = ['============= 订餐明细 ============='];
  for (let {name, count, type, payPrice} of receipts.items) {
    lines.push(`${name} x ${count} = ${payPrice}元`);
  }
  lines.push('-----------------------------------');
  let names = receipts.items.filter(({name, type})=> type === '指定菜品半价').map(({name})=> name);

  if (receipts.totalPrices.totalSaved > 0) {
    lines.push(`使用优惠:`);
    if ((receipts.totalPrices.totalPrice + receipts.totalPrices.totalSaved ) > 30 && receipts.totalPrices.totalSaved === 6) {
      lines.push(`满30减6元，省${receipts.totalPrices.totalSaved}元`);
    } else {
      lines.push(`指定菜品半价(${names.join('，')})，省${receipts.totalPrices.totalSaved}元`);
    }
    lines.push('-----------------------------------');
  }

  lines.push(`总计：${receipts.totalPrices.totalPrice}元`);
  lines.push(`===================================`);
  let receiptItem = lines.join('\n');
  return receiptItem;
}

function bestCharge(ids) {
  let allItems = loadAllItems();
  let promotions = loadPromotions();
  let countedIds = getCountedIds(ids);
  let buyedItems = getBuyedItems(countedIds, allItems);
  let promotionItems = getPromotionItems(buyedItems, promotions);
  let itemPrices = calculatePromotedItems(promotionItems);
  let totalPrices = getTotalPrices(itemPrices);
  let receipts = buildReceipts(itemPrices, totalPrices);
  let receiptItem = buildReceiptString(receipts);
  return receiptItem;
}
