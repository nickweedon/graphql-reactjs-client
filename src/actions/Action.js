

class Action {
  constructor(type) {
    this.type = type;
  }

  dispatch(dispatcher) {
    dispatcher({ ...this });
  }
}

export default Action;
