# Release 2.4.0

## What's Changed
* Implemented: support for using api and client methods from OMS api package (#85zrm1ktj) by @k2maan in https://github.com/hotwax/import/pull/185
* Fixed: save function when updating the missing product is not working by @disha1202 in https://github.com/hotwax/import/pull/183
* Fixed: missing call for unathorised emit in App.vue (#85zrn0xfq) by @k2maan in https://github.com/hotwax/import/pull/186
* Implemented feature to import CSV to reset Inventory(#31a0f22) by @adityasharma7 in https://github.com/hotwax/import/pull/187 and @disha1202 in https://github.com/hotwax/import/pull/106
* Implemented: mappings support for inventory page(#85zrm9dhn) by @adityasharma7 in https://github.com/hotwax/import/pull/188 and @ymaheshwari1 in https://github.com/hotwax/import/pull/179
* Fixed: search not working on PO review page(#85zrmf7ed) by @disha1202 in https://github.com/hotwax/import/pull/182
* Fixed: navigation to login failed for token expire (oms-api#61) by @adityasharma7 in https://github.com/hotwax/import/pull/191
* Fixed: select all not working by @disha1202 in https://github.com/hotwax/import/pull/184


**Full Changelog**: https://github.com/hotwax/import/compare/v2.3.0...v2.4.0

# Release 2.3.0

## What's Changed
* Support for multiple PO's(#85zrjbx58) by @disha1202 in https://github.com/hotwax/import/pull/151, https://github.com/hotwax/import/pull/120, https://github.com/hotwax/import/pull/124, https://github.com/hotwax/import/pull/138, https://github.com/hotwax/import/pull/158 and by @adityasharma7 in https://github.com/hotwax/import/pull/157
* Implemented logger using vue logger plugin(#21uxamh) by @disha1202 in https://github.com/hotwax/import/pull/155
* Refactored: Updated luxon and Improved code for timezone modal and formatUtcDate method (#85zrkd35y) by @k2maan in https://github.com/hotwax/import/pull/160
* fix: disable alert on token expire(#85zrkepcp) by @disha1202 in https://github.com/hotwax/import/pull/162
* Fixed: Re-clicking on Upload file button & cancelling it gives error(#85zrhfp4c) by @shashwatbangar in https://github.com/hotwax/import/pull/139 and by @k2maan in https://github.com/hotwax/import/pull/143
* Implemented: support to sync the mappings with server, added support to update and delete field mapping, and improved the UI for the mapping functionality(#85zrhcq56) by @ymaheshwari1 in https://github.com/hotwax/import/pull/159
* Changing the uploaded file resets all the selected values (#85zrgy0wx) by @k2maan in https://github.com/hotwax/import/pull/172
* Fixed: missing sku not displayed in completed tab after updating items by @disha1202 in https://github.com/hotwax/import/pull/169
* Fix select deselect on purchase order detail page by @disha1202 in https://github.com/hotwax/import/pull/170
* Implemented: toast notification when new version of PWA is available and 'update' button on settings page to refresh the app (#85zrhdgkh) by @k2maan in https://github.com/hotwax/import/pull/174


**Full Changelog**: https://github.com/hotwax/import/compare/v2.2.0...v2.3.0


# Release 2.2.0

## What's Changed
* Implemented: Code to show app version & build information on Settings page(#85zrhn8w8) by @shashwatbangar in https://github.com/hotwax/import/pull/145


**Full Changelog**: https://github.com/hotwax/import/compare/v2.1.0...v2.2.0

# Release 2.1.0

## What's Changed
* Fixed build issue due to eslint version mismatch in dependencies (#85zrhpak3) by @k2maan in https://github.com/hotwax/import/pull/146
* Used npm package for global styles(#31nm26y) by @disha1202 in https://github.com/hotwax/import/pull/147
* Improved handling for invalid date time. (#31nfzxk) by @k2maan in https://github.com/hotwax/import/pull/119


**Full Changelog**: https://github.com/hotwax/import/compare/v2.0.0...v2.1.0

# Release 2.0.0

## What's Changed
* Implemented: support of oms-api package in the product module and updated the code as per the updated schema(#2k05wua) by @ymaheshwari1 in https://github.com/hotwax/import/pull/47
* Implemented: Added static texts to translation file(#85zrhddez) by @k2maan in https://github.com/hotwax/import/pull/141
* Fixed: The save mapping input value should be empty after save action(#85zrh7473) by @shashwatbangar in https://github.com/hotwax/import/pull/128
* Added toast to show 'changes have been successfully applied' on clicking apply button (#2h1ax9r) by @k2maan in https://github.com/hotwax/import/pull/133
* Removed: unwanted code related to search page(#85zrhdn0f) by @ymaheshwari1 in https://github.com/hotwax/import/pull/140


**Full Changelog**: https://github.com/hotwax/import/compare/v1.1.2...v2.0.0


# Release 1.1.2

## What's Changed
* Fixed: SAVE MAPPING button saves empty mapping when file not uploaded(#326re7p) by @shashwatbangar in https://github.com/hotwax/import/pull/114
* Improved: Added missing static texts to translation file(#85zrgxtj0) by @shashwatbangar in https://github.com/hotwax/import/pull/116
* Fixed: Cursor should change to pointer for drop down action menu for records(#85zrgxywt) by @disha1202 in https://github.com/hotwax/import/pull/115


**Full Changelog**: https://github.com/hotwax/import/compare/v1.1.1...v1.1.2

# Release 1.1.1

## What's Changed
* Updated the position of file name label (#31fu19p) by @k2maan in https://github.com/hotwax/import/pull/103
* Fixed: Create new mapping should not show currently selected mapping name(#326r8mq) by @shashwatbangar in https://github.com/hotwax/import/pull/109
* Fixed: User should not be able to select a mapping before uploading a file(#326r315) by @shashwatbangar in https://github.com/hotwax/import/pull/108


**Full Changelog**: https://github.com/hotwax/import/compare/v1.1.0...v1.1.1

# Release 1.1.0

## What's Changed
* Fixed: error in console when having empty field value for buffer days(#2r0myjj) by @disha1202 in https://github.com/hotwax/import/pull/59
* Implemented logic to display the first facility selected and upload file with the original file name(#23ek494) by @disha1202 in https://github.com/hotwax/import/pull/21
* Upgraded ionic to 6.1.15(#2uaz29u) by @disha1202 in https://github.com/hotwax/import/pull/63
* Added pr and issue template by @kaustav202 in https://github.com/hotwax/import/pull/69
* fix: Popover option on a searched product are not working correctly(#2k06eqx) by @disha1202 in https://github.com/hotwax/import/pull/53
* Change console.log to console.error in actions.ts by @divyanshugour in https://github.com/hotwax/import/pull/71
* Improved: app version in package and lock file for new release(#2rbz0yh) by @ymaheshwari1 in https://github.com/hotwax/import/pull/58
* Refactored: removed v-bind and used the shorthand instead (#2yma2j9) by @k2maan in https://github.com/hotwax/import/pull/85
* Fixed: Viewing upload logs should open in a new tab by @disha1202 in https://github.com/hotwax/import/pull/80
* fix: Deselecting a single product from a group, deselects all variants(#2kbkwnr) by @disha1202 in https://github.com/hotwax/import/pull/51
* Fixed: Reseting reverts to wrong info(#2yma5bp) by @disha1202 in https://github.com/hotwax/import/pull/86
* Upgraded Ionic to 6.2(#2zb17hz) by @disha1202 in https://github.com/hotwax/import/pull/89
* Implemented logic to display an alert before route change(#2ymay5f) by @disha1202 in https://github.com/hotwax/import/pull/88
* Added support to alias specific instance URL with environment configuration(#30dkjp1) by @disha1202 in https://github.com/hotwax/import/pull/91
* Fixed: Build console warnings(#30k3pbj) by @shashwatbangar in https://github.com/hotwax/import/pull/92
* Added support to configure date time format from settings page and updated UI of settings page(#2t2y3qq) by @disha1202 in https://github.com/hotwax/import/pull/60
* Fixed: alert displaying on PO upload(#30rz7pt) by @disha1202 in https://github.com/hotwax/import/pull/94
* Fixed: alert not displayed after first upload(#30rz7pt) by @disha1202 in https://github.com/hotwax/import/pull/95
* Improved code to open external links in new tab and update sample date format on clicking save button(#31a00jh) by @ymaheshwari1 in https://github.com/hotwax/import/pull/97
* Block user navigating to details page if no records after review action(#24pp0fm) by @disha1202 in https://github.com/hotwax/import/pull/27
* Updated link for Luxon formats by @Shreyaakothari in https://github.com/hotwax/import/pull/100
* Implemented logic for storing and applying multiple field mappings (#2hran7u) by @disha1202 in https://github.com/hotwax/import/pull/84 and @k2maan in https://github.com/hotwax/import/pull/99

## New Contributors
* @kaustav202 made their first contribution in https://github.com/hotwax/import/pull/69
* @divyanshugour made their first contribution in https://github.com/hotwax/import/pull/71
* @k2maan made their first contribution in https://github.com/hotwax/import/pull/85
* @Shreyaakothari made their first contribution in https://github.com/hotwax/import/pull/100

**Full Changelog**: https://github.com/hotwax/import/compare/v1.0.1...v1.1.0


# Release 1.0.1

## What's Changed
* Update contribution guideline in Readme file(#2r0kmb3) by @azkyakhan in https://github.com/hotwax/import/pull/56
* Implemented: Code to check if user has permission to access the app(#2hr41aq) by @shashwatbangar in https://github.com/hotwax/import/pull/57
* Implemented: Display instance and time-zone at the bottom of the menu in ion footer(#28u2prh) by @shashwatbangar in https://github.com/hotwax/import/pull/52
* Improved code by displaying instance and current time zone in the bottom of the menu(#28u2prh) by @azkyakhan in https://github.com/hotwax/import/pull/35

## New Contributors
* @shashwatbangar made their first contribution in https://github.com/hotwax/import/pull/57

**Full Changelog**: https://github.com/hotwax/import/compare/v1.0.0...v1.0.1


# Release 1.0.0

## What's Changed
* Renamed: ionic sdk to import(#22c8vaw) by @disha1202 in https://github.com/hotwax/import/pull/1
* Updated Readme with app specific instructions(#22hrju8) by @disha1202 in https://github.com/hotwax/import/pull/2
* Implemented static UI for purchase order page(#22c8vdc) by @disha1202 in https://github.com/hotwax/import/pull/3
* Implemented: logic to parse csv file and display in console(#22c8vdr) by @disha1202 in https://github.com/hotwax/import/pull/4
* Upgraded to ionic 6(#22c8vcc) by @disha1202 in https://github.com/hotwax/import/pull/7
* Improved: facilityName should be displayed instead of facilityId in store selection along with Store as label ( #21fn6e5 ). by @meet-aniket in https://github.com/hotwax/import/pull/6
* Added firebase auto deployment configuration by @adityasharma7 in https://github.com/hotwax/import/pull/9
* Implemented: service to prepare payload for upload and upload json file for import (#232z1wx) by @adityasharma7 in https://github.com/hotwax/import/pull/10
* Implemented: logic to edit data #22c8vgh by @disha1202 in https://github.com/hotwax/import/pull/8
* Implemented logic to check/uncheck products(#22xdye3) by @disha1202 in https://github.com/hotwax/import/pull/11
* Implemented logic to update facility(#22xdyng) by @disha1202 in https://github.com/hotwax/import/pull/12
* Implemented logic to save updated data(#2334jke) by @disha1202 in https://github.com/hotwax/import/pull/13
* Implemented logic to display toast for success/error after upload act… by @disha1202 in https://github.com/hotwax/import/pull/15
* Implemented logic to search products on order detail page(#22xdyku) by @disha1202 in https://github.com/hotwax/import/pull/14
* Updated the UI by @Nihu-Sharma in https://github.com/hotwax/import/pull/17
* Implemented logic to show alerts before save and leave page(#238mr4d) by @disha1202 in https://github.com/hotwax/import/pull/18
* Improved markup and styling by @Nihu-Sharma in https://github.com/hotwax/import/pull/19
* Updated logic to display physical facilities(#23ek494) by @disha1202 in https://github.com/hotwax/import/pull/20
* Implemented revert functionality#22xdxhp by @disha1202 in https://github.com/hotwax/import/pull/22
* Added PWA Configuration (#226cynn) by @Mayank909 in https://github.com/hotwax/import/pull/23
* Improved: code to group the items based on the parent and improve logic to select and unselect a product(#24phanv) by @ymaheshwari1 in https://github.com/hotwax/import/pull/26
* Updated logic to clear orders list through actions(#2335ca9) by @disha1202 in https://github.com/hotwax/import/pull/16
* Updated the code to make date format configurable through env file(#24gtujf) by @disha1202 in https://github.com/hotwax/import/pull/28
* Improved code to pass viewSize in all list queries (#24pfzq8) by @meet-aniket in https://github.com/hotwax/import/pull/30
* Implemented logic to handle the case when product SKU is not present on  the server (#245fb8k). by @meet-aniket in https://github.com/hotwax/import/pull/31
* Implemented logic to handle case when the product sku is not present on server(#245fb8k) by @disha1202 in https://github.com/hotwax/import/pull/25
* Refactored markup and styling(#245fw5p) by @azkyakhan in https://github.com/hotwax/import/pull/24
* Improved: code to fix login error when having spaces in the fields (#20jwqu1). by @meet-aniket in https://github.com/hotwax/import/pull/32
* Added time-outline icon for timezone in import app(#25k73ff) by @Nihu-Sharma in https://github.com/hotwax/import/pull/34
* Removed timezone mismatch alert on login(2893rqm) by @Nihu-Sharma in https://github.com/hotwax/import/pull/36
* Fixed: facilities not updated on login & logout(#2adma3f) by @disha1202 in https://github.com/hotwax/import/pull/39
* Added interface popover to close it after field select(#2adm9yq) by @disha1202 in https://github.com/hotwax/import/pull/37
* Improved: code to use enter instead of input for Timezone search (#2cj8zmd). by @meet-aniket in https://github.com/hotwax/import/pull/42
* Improved: code to assign input field to instance variable for searchbar (#2cj8nc4). by @meet-aniket in https://github.com/hotwax/import/pull/44
* Improved: position of toast from top to bottom(#2a7ut0j) by @Mayank909 in https://github.com/hotwax/import/pull/45
* Improved: code to hide option to set baseURL if value available in '.env' file (#29wgkkh). by @Mayank909 in https://github.com/hotwax/import/pull/43
* Fixed: Instance URL should be case insensitive(#2ft61zw) by @rathoreprashant in https://github.com/hotwax/import/pull/48
* Updated the code to use hc facilityId when applying facility on PO details page(#2admaej) by @disha1202 in https://github.com/hotwax/import/pull/41
* Implemented logic to clear order state and uploaded data on logout(#2admadb) by @disha1202 in https://github.com/hotwax/import/pull/40
* Implemented logic to close popover after selecting option(#24wcdrw) by @disha1202 in https://github.com/hotwax/import/pull/49
* Revert: Apply token encryption changes by @disha1202 in https://github.com/hotwax/import/pull/54
* Improved: the app description in package file(#2quv0kc) by @ymaheshwari1 in https://github.com/hotwax/import/pull/55

## New Contributors
* @disha1202 made their first contribution in https://github.com/hotwax/import/pull/1
* @meet-aniket made their first contribution in https://github.com/hotwax/import/pull/6
* @adityasharma7 made their first contribution in https://github.com/hotwax/import/pull/9
* @Nihu-Sharma made their first contribution in https://github.com/hotwax/import/pull/17
* @Mayank909 made their first contribution in https://github.com/hotwax/import/pull/23
* @ymaheshwari1 made their first contribution in https://github.com/hotwax/import/pull/26
* @azkyakhan made their first contribution in https://github.com/hotwax/import/pull/24
* @rathoreprashant made their first contribution in https://github.com/hotwax/import/pull/48

**Full Changelog**: https://github.com/hotwax/import/commits/v1.0.0
