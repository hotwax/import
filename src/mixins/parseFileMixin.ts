import store from "@/store";
import { parseCsv } from "@/utils";

export default {
  methods: {
    async parseCsv(file: any) {
      store.dispatch('order/updateFileName', file.name);
      return await parseCsv(file).then(res => res)
    }
  }
}