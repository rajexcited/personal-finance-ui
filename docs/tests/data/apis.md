# List of all Api

| Http Method | Api Url                                                            | short name                      |
| ----------- | ------------------------------------------------------------------ | ------------------------------- |
| POST        | /api/user/login                                                    | user login api                  |
| POST        | /api/user/signup                                                   | user signup api                 |
| POST        | /api/user/logout                                                   | user logout api                 |
| POST        | /api/user/details                                                  | user details api                |
| POST        | /api/user/refresh                                                  | user refresh session api        |
| GET         | /api/user/details                                                  | user details api                |
| DELETE      | /api/user/details                                                  | user details api                |
| -           | -                                                                  | -                               |
| GET         | /api/expenses/count                                                | expense count api               |
| GET         | /api/expenses                                                      | expense api                     |
| -           | -                                                                  | -                               |
| GET         | /api/expenses/income/tags                                          | income tags api                 |
| GET         | /api/expenses/income/id/<id>                                       | income api                      |
| POST        | /api/expenses/income/                                              | income api                      |
| DELETE      | /api/expenses/income/id/<id>                                       | income api                      |
| GET         | /api/expenses/income/id/<id>/receipts/id/<rid>                     | income receipt api              |
| POST        | /api/expenses/income/id/<id>/receipts/id/<rid>                     | income receipt api              |
| -           | -                                                                  | -                               |
| GET         | /api/expenses/purchase/tags                                        | purchase tags api               |
| GET         | /api/expenses/purchase/id/<id>                                     | purcahse api                    |
| POST        | /api/expenses/purchase/                                            | purchase api                    |
| DELETE      | /api/expenses/purchase/id/<id>                                     | purchase api                    |
| GET         | /api/expenses/purchase/id/<id>/receipts/id/<rid>                   | purchase receipt api            |
| POST        | /api/expenses/purchase/id/<id>/receipts/id/<rid>                   | purchase receipt api            |
| -           | -                                                                  | -                               |
| GET         | /api/expenses/refund/tags                                          | refund tags api                 |
| GET         | /api/expenses/refund/id/<id>                                       | refund api                      |
| POST        | /api/expenses/refund/                                              | refund api                      |
| DELETE      | /api/expenses/refund/id/<id>                                       | refund api                      |
| GET         | /api/expenses/refund/id/<id>/receipts/id/<rid>                     | refund receipt api              |
| POST        | /api/expenses/refund/id/<id>/receipts/id/<rid>                     | refund receipt api              |
| -           | -                                                                  | -                               |
| GET         | /api/stats/income                                                  | income stats api                |
| GET         | /api/stats/purchase                                                | purchase stats api              |
| GET         | /api/stats/refund                                                  | refund stats api                |
| -           | -                                                                  | -                               |
| GET         | /api/payment/accounts/tags                                         | payment account tags api        |
| GET         | /api/payment/accounts                                              | payment account api             |
| GET         | /api/payment/accounts/id/<id>                                      | payment account api             |
| POST        | /api/payment/accounts                                              | payment account api             |
| DELETE      | /api/payment/accounts/id/<id>                                      | payment account api             |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/income-type/tags                      | income type tags api            |
| GET         | /api/config/types/belongs-to/income-type                           | income type api                 |
| GET         | /api/config/types/belongs-to/income-type/id/<id>                   | income type api                 |
| POST        | /api/config/types/belongs-to/income-type                           | income type api                 |
| DELETE      | /api/config/types/belongs-to/income-type/id/<id>                   | income type api                 |
| POST        | /api/config/types/belongs-to/income-type/id/<id>/status/<st>       | income type status api          |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/purchase-type/tags                    | purchase type tags api          |
| GET         | /api/config/types/belongs-to/purchase-type                         | purchase type api               |
| GET         | /api/config/types/belongs-to/purchase-type/id/<id>                 | purchase type api               |
| POST        | /api/config/types/belongs-to/purchase-type                         | purchase type api               |
| DELETE      | /api/config/types/belongs-to/purchase-type/id/<id>                 | purchase type api               |
| POST        | /api/config/types/belongs-to/purchase-type/id/<id>/status/<st>     | purchase type status api        |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/refund-reason/tags                    | refund reason tags api          |
| GET         | /api/config/types/belongs-to/refund-reason                         | refund reason api               |
| GET         | /api/config/types/belongs-to/refund-reason/id/<id>                 | refund reason api               |
| POST        | /api/config/types/belongs-to/refund-reason                         | refund reason api               |
| DELETE      | /api/config/types/belongs-to/refund-reason/id/<id>                 | refund reason api               |
| POST        | /api/config/types/belongs-to/refund-reason/id/<id>/status/<st>     | refund reason status api        |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/pymt-account-type/tags                | payment account type tags api   |
| GET         | /api/config/types/belongs-to/pymt-account-type                     | payment account type api        |
| GET         | /api/config/types/belongs-to/pymt-account-type/id/<id>             | payment account type api        |
| POST        | /api/config/types/belongs-to/pymt-account-type                     | payment account type api        |
| DELETE      | /api/config/types/belongs-to/pymt-account-type/id/<id>             | payment account type api        |
| POST        | /api/config/types/belongs-to/pymt-account-type/id/<id>/status/<st> | payment account type status api |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/currency-profile/tags                 | currency profile tags api       |
| GET         | /api/config/types/belongs-to/currency-profile                      | currency profile api            |
| GET         | /api/config/types/belongs-to/currency-profile/id/<id>              | currency profile api            |
| POST        | /api/config/types/belongs-to/currency-profile                      | currency profile api            |
| DELETE      | /api/config/types/belongs-to/currency-profile/id/<id>              | currency profile api            |
| POST        | /api/config/types/belongs-to/currency-profile/id/<id>/status/<st>  | currency profile status api     |
| -           | -                                                                  | -                               |
| GET         | /api/config/types/belongs-to/share-person/tags                     | share person tags api           |
| GET         | /api/config/types/belongs-to/share-person                          | share person api                |
| GET         | /api/config/types/belongs-to/share-person/id/<id>                  | share person api                |
| POST        | /api/config/types/belongs-to/share-person                          | share person api                |
| DELETE      | /api/config/types/belongs-to/share-person/id/<id>                  | share person api                |
| POST        | /api/config/types/belongs-to/share-person/id/<id>/status/<st>      | share person status api         |
| -           | -                                                                  | -                               |
