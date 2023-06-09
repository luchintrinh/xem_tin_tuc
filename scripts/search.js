"use strict";

let newsContainer = document.querySelector("#news-container");
let btnPrev = document.querySelector("#btn-prev");
let btnNext = document.querySelector("#btn-next");
let pageNum = document.querySelector("a#page-num");
let inputQuery = document.querySelector("#input-query");
let btnSubmit = document.querySelector("#btn-submit");
let containerNumber = document.querySelector("#nav-page-num");

let curPage = 1;
let search = "";

// người dùng đang đăng nhập
let currentUser = localStorage.hasOwnProperty("currentUser")
  ? JSON.parse(getFromStorage("currentUser", ""))
  : "";
// ẩn nút chuyển trang
containerNumber.style.display = "none";
if (currentUser) {
  // nếu chưa có bài báo nào thì nút chuyển trang sẽ ẩn đi

  // gán số trang mặc định khi load tin
  pageNum.textContent = curPage;
  // ấn vào nút previous
  btnPrev.addEventListener("click", function () {
    getNews(search, --curPage);
    pageNum.textContent = curPage;
  });
  btnNext.addEventListener("click", function () {
    getNews(search, ++curPage);
    pageNum.textContent = curPage;
  });
  //   khi ấn vào nút tìm kiếm
  btnSubmit.addEventListener("click", function () {
    if (inputQuery.value !== "") {
      search = inputQuery.value;
      curPage = 1;
      getNews(search, curPage);
    } else {
      alert("Hãy nhập từ khóa tìm kiếm!");
    }
  });
} else {
  alert("Hãy đăng nhập trước!");
  btnSubmit.addEventListener("click", function () {
    alert("Hãy đăng nhập!");
  });
}

function handler(pageNumber) {
  // nếu là trang đầu tiên thì ẩn nút previous đi
  if (pageNum.textContent == 1) {
    btnPrev.style.display = "none";
  } else {
    btnPrev.style.display = "block";
  }
  if (pageNum.textContent == pageNumber) {
    btnNext.style.display = "none";
  } else {
    btnNext.style.display = "block";
  }
}

async function getNews(keyword, page) {
  try {
    const news = await fetch(
      `https://newsapi.org/v2/top-headlines?sortBy=relevancy&q=${keyword}&category=${currentUser.category}&pageSize=${currentUser.pageNumber}&page=${page}&apiKey=2ee74fd226ee4684b40837b69c4e95d7`
    );

    const newsArr = await news.json();
    //   lỗi khi truy cập quá 100 lần trên ngày
    if (newsArr.code === "rateLimited" && newsArr.status === "error") {
      throw new Error("đã truy cập quá giới hạn 100 lần");
    }
    // bắt lỗi khi chạy từ tập tin không thông qua server

    if (newsArr.code === "corsNotAllowed") {
      throw new Error(newsArr.message);
    }
    if (newsArr.totalResults === 0) {
      containerNumber.style.display = "none";
      throw new Error("không có kết quả tìm kiếm");
    }
    if (Math.ceil(newsArr.totalResults / currentUser.pageNumber) > 1) {
      containerNumber.style.display = "block";
    }
    renderNew(newsArr.articles);
    handler(Math.ceil(newsArr.totalResults / currentUser.pageNumber));
  } catch (err) {
    alert(err.message);
  }
}

function renderNew(arr) {
  let html = "";
  arr.map(function (news) {
    html += `
    <div class="card flex-row flex-wrap">
					<div class="card mb-3" style="">
						<div class="row no-gutters">
							<div class="col-md-4">
								<img src=${news.urlToImage ? news.urlToImage : "../images/notfound.jpg"}
									class="card-img"
									alt=${news.title}>
							</div>
							<div class="col-md-8">
								<div class="card-body">
									<h5 class="card-title">${news.title}</h5>
									<p class="card-text">${news.description}...</p>
									<a href=${news.url} target="_blank"
										class="btn btn-primary">View</a>
								</div>
							</div>
						</div>
					</div>
				</div>
    `;
  });
  newsContainer.innerHTML = html;
}
