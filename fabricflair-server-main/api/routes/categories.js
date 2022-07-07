const express = require("express");
const router = express.Router();
var unirest = require("unirest");

function categoryIncluded(categories, cat_id) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i] == cat_id) {
      return true;
    }
  }
  return false;
}

router.get("/getCategories", (request, response) => {
  var req = unirest(
    "GET",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories/tree"
  );

  req.headers({
    accept: "application/json",
    "content-type": "application/json",
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  let data = [];

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    res.body["data"].forEach((element) => {
      if (element["children"].length == 0) {
        data.push({ id: element["id"], itemName: element["name"] });
      } else {
        element["children"].forEach((category) => {
          data.push({ id: category["id"], itemName: category["name"] });
        });
      }
    });

    response.status(200).json({
      data: data,
    });
  });
});

router.get("/getCategoriesTree", (request, response) => {
  var req = unirest(
    "GET",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories/tree"
  );

  req.headers({
    accept: "application/json",
    "content-type": "application/json",
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  let categories = [];

  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    res.body["data"].forEach((parent_cat) => {
      let parent_id = parent_cat["id"];
      let parent_name = parent_cat["name"];
      let children = [];
      parent_cat["children"].forEach((sub_cat) => {
        children.push({ id: sub_cat["id"], name: sub_cat["name"] });
      });

      categories.push({
        parent_id: parent_id,
        parent_name: parent_name,
        children: children,
      });
    });

    response.status(200).json({
      categories: categories,
    });
  });
});

router.post("/createParentCategory", (request, response) => {
  var req = unirest(
    "POST",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories"
  );
  req.headers({
    accept: "application/json",
    "content-type": "application/json",
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  console.log(request.body.name);

  req.type("json");
  req.send({
    name: request.body.name,
    parent_id: 0,
  });

  req.end(function (res) {
    if (res.error) {
      response.status(500).json({
        error: res.error,
      });
    } else {
      response.status(200).json({
        response: res.body,
      });
    }
  });
});

router.post("/createSubCategory", (request, response) => {
  var req = unirest(
    "POST",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories"
  );
  req.headers({
    accept: "application/json",
    "content-type": "application/json",
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  console.log(request.body.name);

  req.type("json");
  req.send({
    name: request.body.name,
    parent_id: request.body.parent_id,
  });

  req.end(function (res) {
    if (res.error) {
      response.status(500).json({
        error: res.error,
      });
    } else {
      response.status(200).json({
        response: res.body,
      });
    }
  });
});

router.patch("/deleteSubCategory", (request, response) => {
  const cat_id = request.body.category_id;

  var req = unirest(
    "GET",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/products?page=1&limit=250"
  );

  req.headers({
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  let cat_included = false;
  req.end(function (res) {
    res.body["data"].forEach((product) => {
      if (categoryIncluded(product["categories"], cat_id) == true) {
        cat_included = true;
      }
    });

    if (cat_included == true) {
      response.status(200).json({
        error: "This category has products attached to them",
      });
    } else {
      // CATEGORY DELETION REQUEST

      var req = unirest(
        "DELETE",
        "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories/" +
          cat_id
      );
      req.headers({
        accept: "application/json",
        "content-type": "application/json",
        "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
        "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
      });

      req.end(function (res) {
        console.log(res.body);

        if (res.body == undefined) {
          response.status(200).json({
            status: "deleted",
          });
        } else {
          response.status(200).json({
            status: "failed",
          });
        }
      });
    }
  });
});

router.patch("/deleteParentCategory", (request, response) => {
  const cat_id = request.body.category_id;
  const cat_children = request.body.category_children;

  var req = unirest(
    "GET",
    "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/products?page=1&limit=250"
  );

  req.headers({
    "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
    "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
  });

  var withProducts = false;
  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    res.body["data"].forEach((product) => {
      if (categoryIncluded(product["categories"], cat_id) == true) {
        withProducts = true;
      }
    });

    if (withProducts == true) {
      response.status(200).json({
        error: "This category has products attached to them",
      });
    } else {
      console.log(cat_children);

      if (cat_children.length == 0) {
        /// DELETE CATEGORY
        var req = unirest(
          "DELETE",
          "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories/" +
            cat_id
        );
        req.headers({
          accept: "application/json",
          "content-type": "application/json",
          "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
          "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
        });

        req.end(function (res) {
          console.log(res.body);

          if (res.body == undefined) {
            response.status(200).json({
              status: "deleted",
            });
          } else {
            response.status(200).json({
              status: "failed",
            });
          }
        });
      } else {
        // CHECK SUB CATEGORIES
        var sub_cat_ids = [];
        cat_children.forEach((sub_cat) => {
          sub_cat_ids.push(sub_cat["id"]);
        });

        for (let index = 0; index < sub_cat_ids.length; index++) {
          const id = sub_cat_ids[index];
          for (let i = 0; i < res.body["data"].length; i++) {
            const product = res.body["data"][i];
            if (categoryIncluded(product["categories"], id) == true) {
              withProducts = true;
              index = sub_cat_ids.length;
              break;
            }
          }
        }

        if (withProducts == true) {
          response.status(200).json({
            error: "One of the sub-categories has products attached to them",
          });
        } else {
          // DELETE PARENT CATEGORY AND ALL SUBS
          var req = unirest(
            "DELETE",
            "https://api.bigcommerce.com/stores/hzc9x65who/v3/catalog/categories/" +
              cat_id
          );
          req.headers({
            accept: "application/json",
            "content-type": "application/json",
            "x-auth-client": "hghavsexqd117ksv58y5qcsnjarqye5",
            "x-auth-token": "r1hcuqdvtdd66wn88gb8qo49fnzfrjk",
          });

          req.end(function (res) {
            console.log(res.body);

            if (res.body == undefined) {
              response.status(200).json({
                status: "deleted",
              });
            } else {
              response.status(200).json({
                status: "failed",
              });
            }
          });
        }
      }
    }
  });
});

module.exports = router;
