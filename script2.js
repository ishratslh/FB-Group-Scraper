function exportToCsv(e, t) {
    for (var n = "", o = 0; o < t.length; o++)
      n += (function (e) {
        for (var t = "", n = 0; n < e.length; n++) {
          var o =
            null === e[n] || void 0 === e[n] ? "" : e[n].toString();
          o = o instanceof Date ? e[n].toLocaleString() : o;
          o = o.replace(/"/g, '""');
          if (n > 0) t += ",";
          t += o.search(/("|,|\n)/g) >= 0 ? '"' + o + '"' : o;
        }
        return t + "\n";
      })(t[o]);
    var r = new Blob([n], { type: "text/csv;charset=utf-8;" }),
      i = document.createElement("a");
    if (void 0 !== i.download) {
      r = URL.createObjectURL(r);
      i.setAttribute("href", r);
      i.setAttribute("download", e);
      document.body.appendChild(i);
      i.click();
      document.body.removeChild(i);
    }
  }
  
  function buildCTABtn() {
    var e = document.createElement("div"),
      t = (e.setAttribute(
        "style",
        [
          "position: fixed;",
          "top: 0;",
          "left: 0;",
          "z-index: 10;",
          "width: 100%;",
          "height: 100%;",
          "pointer-events: none;",
        ].join("")
      ),
      document.createElement("div")),
      n = (t.setAttribute(
        "style",
        [
          "position: absolute;",
          "bottom: 30px;",
          "right: 130px;",
          "color: white;",
          "min-width: 150px;",
          "background: var(--primary-button-background);",
          "border-radius: var(--button-corner-radius);",
          "padding: 0px 12px;",
          "cursor: pointer;",
          "font-weight: 600;",
          "font-size: 15px;",
          "display: inline-flex;",
          "pointer-events: auto;",
          "height: 36px;",
          "align-items: center;",
          "justify-content: center;",
        ].join("")
      ),
      document.createTextNode("Download ")),
      o = document.createElement("span"),
      r = (o.setAttribute("id", "fb-group-scraper-number-tracker"),
      (o.textContent = "0"),
      document.createTextNode(" members"));
    return (
      t.appendChild(n),
      t.appendChild(o),
      t.appendChild(r),
      t.addEventListener("click", function () {
        var e = new Date().toISOString();
        exportToCsv("groupMemberExport-".concat(e, ".csv"), window.members_list);
      }),
      e.appendChild(t),
      document.body.appendChild(e),
      e
    );
  }
  
  function processResponse(e) {
    var t, n;
    if (
      null !== (t = null == e ? void 0 : e.data) &&
      void 0 !== t &&
      t.group
    )
      o = e.data.group;
    else {
      if (
        "Group" !==
        (null ==
          (t = null == (t = null == e ? void 0 : e.data) || void 0 === t ? void 0 : t.node) ||
        void 0 === t
          ? void 0
          : t.__typename)
      )
        return;
      o = e.data.node;
    }
    if (
      null !== (t = null == o ? void 0 : o.new_members) &&
      void 0 !== t &&
      t.edges
    )
      n = o.new_members.edges;
    else if (
      null !== (e = null == o ? void 0 : o.new_forum_members) &&
      void 0 !== e &&
      e.edges
    )
      n = o.new_forum_members.edges;
    else {
      if (
        null == (t = null == o ? void 0 : o.search_results) ||
        void 0 === t ||
        !t.edges
      )
        return;
      n = o.search_results.edges;
    }
    var e = n.map(function (e) {
        var t = e.node,
          n = t.id,
          o = t.name,
          r = t.bio_text,
          i = t.url,
          s = t.profile_picture,
          t = t.__isProfile,
          d =
            null != (d = null == e ? void 0 : e.join_status_text) && void 0 !== d
              ? d.text
              : null !=
                  (d = null ==
                    (d = null == e ? void 0 : e.membership) || void 0 === d
                      ? void 0
                      : d.join_status_text) && void 0 !== d
              ? d.text
              : void 0,
          e = null == (e = e.node.group_membership) || void 0 === e ? void 0 : e.associated_group.id;
        return [
          n,
          o,
          i,
          void 0 == r ? "" : r.text || "",
          void 0 == s ? "" : s.uri || "",
          e,
          d || "",
          t,
        ];
      }),
      o = (t = window.members_list).push.apply(t, e),
      o = document.getElementById("fb-group-scraper-number-tracker");
    o && (o.textContent = window.members_list.length.toString());
  }
  
  function parseResponse(e) {
    var n = [];
    try {
      n.push(JSON.parse(e));
    } catch (t) {
      var o = e.split("\n");
      if (o.length <= 1)
        return void console.error("Fail to parse API response", t);
      for (var r = 0; r < o.length; r++) {
        var i = o[r];
        try {
          n.push(JSON.parse(i));
        } catch (e) {
          console.error("Fail to parse API response", t);
        }
      }
    }
    for (var t = 0; t < n.length; t++) processResponse(n[t]);
  }
  
  function autoScroll() {
    // Faites défiler automatiquement la page vers le bas
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  function stopAutoScroll() {
    // Arrête le scroll automatique lorsque vous quittez la page du groupe
    clearInterval(scrollInterval);
  }
  
  function main() {
    buildCTABtn();
    var e = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener(
        "readystatechange",
        function () {
          this.responseURL.includes("/api/graphql/") &&
            4 === this.readyState &&
            parseResponse(this.responseText);
        },
        false
      );
      e.apply(this, arguments);
    };
  
    // Auto-scroll toutes les 2 secondes
    var scrollInterval = setInterval(autoScroll, 40000);
  
    // Écoute l'événement "unload" pour arrêter le scroll automatique avant de quitter la page
    window.addEventListener("unload", stopAutoScroll);
  }

window.members_list = window.members_list || [
  ["Profile Id", "Full Name", "ProfileLink", "Bio", "Image Src", "Groupe Id", "Group Joining Text", "Profile Type"],
];
main();

  
