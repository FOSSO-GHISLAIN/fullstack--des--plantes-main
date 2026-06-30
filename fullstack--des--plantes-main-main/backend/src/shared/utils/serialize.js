function toId(doc) {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = plain;
  return { id: (_id || '').toString(), ...rest };
}

function toIdList(docs) {
  return (docs || []).map(toId);
}

module.exports = { toId, toIdList };
