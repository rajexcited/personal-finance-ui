import { IDBPDatabase } from "idb";
import {
  addUpdateItems,
  deleteDatabase,
  deleteItemFromStore,
  deleteItemsFromIndex,
  getAllItemsFromIndex,
  getAllItemsFromStore,
  getItemFromIndex,
  getItemFromStore,
  IdbWindow,
  openDatabase
} from "./db-helper";
import { IndexedDbName } from "./resource";

function injectIdb() {
  return cy.window().then((win) => {
    const wind = win as IdbWindow;
    if (!wind.__idb__) {
      console.log(new Date(), "idb not initialized");
      return cy.fixture("idb-bundle.js.txt").then((scriptContent) => {
        console.log("idb bundle script content");
        return cy.get("head").then(($head) => {
          const script = document.createElement("script");
          script.type = "text/javascript";
          // script.src = "cypress/fixures/idb-bundle.js.txt";
          script.text = scriptContent;
          // const scriptLoadedPromise = new Cypress.Promise((resolve) => {
          //   script.onload = resolve;
          // });
          $head.append(script);
          // $body.append("<span>aksdhjaksda</span>");
          // console.log($body);
          // console.log(script);
          // console.log($body.find("script"));
          // console.log((win as IdbWindow).__idb__);
          // return scriptLoadedPromise.then((ev) => {
          console.log("Script loaded and executed");
          console.log(new Date(), "inside head after idb load", wind.__idb__);
          if (!wind.__idb__) {
            throw new Error("idb is not initialized");
          }
          //   return ev;
          // });
          cy.wait(100);
        });
        // console.log("delete database", (win as IdbWindow).__idb__);
        // let promise;
        // if (databaseName) {
        //   promise = deleteDatabase(win, databaseName);
        // } else {
        //   deleteDatabase(win, "expenseDb").then(() => {
        //     promise = deleteDatabase(win, "mock-expenseDb");
        //   });
        // }
        // return promise;
      });
    }

    // console.log(new Date(), "script is loaded and idb is initialized already");
  });
}

Cypress.Commands.add("deleteIndexedDb", (databaseName?: IndexedDbName) => {
  injectIdb().then(() => {
    cy.window().then(async (win) => {
      console.log("delete database");
      if (databaseName) {
        return deleteDatabase(win, databaseName);
      }
      return deleteDatabase(win, IndexedDbName.Expense).then(async () => deleteDatabase(win, IndexedDbName.MockExpense));
    });
  });
});

Cypress.Commands.add("indexedDb", (databaseName: IndexedDbName) => {
  injectIdb().then(() => {
    return cy.window().then((win) => {
      return openDatabase(win, databaseName);
    });
  });
});

type StoreOnlyOptions = { storeName: string };
type StoreOptions = { storeName: string; indexName?: string };

Cypress.Commands.add("clearStore", { prevSubject: true }, (db: IDBPDatabase, options: StoreOnlyOptions) => {
  cy.then(async () => {
    let keys = await db.getAllKeys(options.storeName);
    console.log(`found ${keys.length} keys in store`, options.storeName, "deleting ", keys);
    await db.clear(options.storeName);

    keys = await db.getAllKeys(options.storeName);
    console.log("all items in store are deleted. not deleted keys", keys);
    db.close();
  });
});

Cypress.Commands.add("getItem", { prevSubject: true }, <T>(db: IDBPDatabase, key: string, options: StoreOptions) => {
  let resPromise: Promise<T | T[] | null>;
  if (options.indexName) {
    resPromise = getItemFromIndex(db, options.storeName, options.indexName, key);
  } else {
    resPromise = getItemFromStore(db, options.storeName, key);
  }
  return cy.wrap(resPromise).then((results) => {
    db.close();
    return results as T;
  });
});

Cypress.Commands.add("getItems", { prevSubject: true }, <T>(db: IDBPDatabase, options: StoreOptions, key?: string) => {
  let resPromise: Promise<T[]>;
  if (options.indexName) {
    resPromise = getAllItemsFromIndex(db, options.storeName, options.indexName, key);
  } else {
    resPromise = getAllItemsFromStore(db, options.storeName, key);
  }
  return cy.wrap(resPromise).then((results) => {
    db.close();
    return results as T[];
  });
});

Cypress.Commands.add("updateItems", { prevSubject: true }, <T>(db: IDBPDatabase, items: T[], options: StoreOnlyOptions) => {
  cy.then(async () => addUpdateItems(db, options.storeName, items)).then(() => db.close());
  return cy.wrap(items);
});

Cypress.Commands.add("deleteItem", { prevSubject: true }, (db: IDBPDatabase, key: string, options: StoreOnlyOptions) => {
  cy.then(async () => deleteItemFromStore(db, options.storeName, key)).then(() => db.close());
});

Cypress.Commands.add("deleteItems", { prevSubject: true }, (db: IDBPDatabase, keys: string | string[], options: StoreOptions) => {
  cy.then(async () => {
    const deleteItems = async (k: string) => {
      if (options.indexName) {
        await deleteItemsFromIndex(db, options.storeName, options.indexName, k);
      } else {
        await deleteItemFromStore(db, options.storeName, k);
      }
    };

    if (Array.isArray(keys)) {
      const promises = keys.map(deleteItems);
      return Promise.all(promises);
    }
    return deleteItems(keys);
  }).then(() => db.close());
});
