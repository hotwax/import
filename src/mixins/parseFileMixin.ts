import { translate } from "@/i18n";
import store from "@/store";
import { showToast, parseCsv } from "@/utils";

export default {
  methods: {
    async parseCsv(file: any) {
      if (file) {
        store.dispatch('order/updateFileName', file.name);
        const csvData = await parseCsv(file).then( res => {
          return  res;
        })
        showToast(translate("File uploaded successfully"));
        return csvData;
      }
      showToast(translate("Something went wrong, Please try again")); 
    }
  }
}