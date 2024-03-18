import store from "@/store";
import { parseCsv } from "@/utils";

export default {
  methods: {
    async parseCsv(file: any) {
      store.dispatch('order/updateFileName', file.name);
      const csvData = await parseCsv(file).then(res => {
        return res;
      })
      return csvData;
    }
  }
}