import { translate } from "@/i18n";
import store from "@/store";
import { showToast, parseCsv } from "@/utils";

export default {
  methods: {
   async getFile(file: any) {
      if (file) {
          showToast(translate("File uploaded successfully"));
          store.dispatch('order/updateFileName', file.name);
          
          const csvData = await parseCsv(file).then( res => {
          return  res;
        })
        return csvData;
      }
      showToast(translate("Something went wrong, Please try again")); 
    }
  }
}