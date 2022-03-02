export default interface OrderState {
    order: {
      list:{
        items: any,
        original: any
      }
      originalCsv: any,
      grouped: any,
      modifiedCsv: any
    }
  }