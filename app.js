import agent from 'superagent-bluebird-promise';
import  { Octokit } from '@octokit/rest';
import moment from 'moment';
const Promise = require('bluebird');


let urls = []

let jon = ''
let thesavage = ''
let user32 = ''
let accounts = [user32]
let account = accounts[Math.floor(Math.random()*accounts.length)];
console.log('account is', account)
const gh = new Octokit({
  auth:  account
})
const getCommits = (owner, repo) => {
        //console.log('fetching commits', owner, repo);
	return gh.rest.repos.listCommits({owner, repo})
      
}

const searchCode = (query, page) => {
  return  gh.rest.search.code({q: query, page, order:'asc', sort: 'indexed', per_page: 100})
   .then(res => {
     return res.data.items
  })
}
const searchRepos = (query, page) => {
  let urls = []
 return gh.rest.search.repos({q: 'from binance import Client', page, per_page: 100, order:'asc', sort:'indexed'}).then(res => {
        const { data } = res;
        //console.log(data.items[0]) 
	return Promise.all(Promise.map(data.items, item => {
           return getCommits(item.owner.login, item.name)
    }))
 })
}


const query = 'from binance import Client'

//const isRateLimited = () => {
 //return gh.rest.rateLimit.get()
//}

//isRateLimited().then(res => console.log('rate limit info', res))



const runBot = async () => {
  const keyword = 'config'
  for(var i=0; i< 10; i++) {
    searchCode(query, i)
  .then(res => {
		const owners = res.map(item => item.repository.owner.login)
    const repos = res.map(item => item.repository.name)
     res.forEach(repo => {
   		const owner = repo.repository.owner.login;
      const rep = repo.repository.name
     return getCommits(repo.repository.owner.login, repo.repository.name).then(commits => {
               //console.log('what do i do with these', Object.keys(commits.data[0]))
               const hits = commits.data.filter(commit => commit.commit.message.includes(keyword)).map(item => item.html_url)
               console.log(hits)
   	})
    })
  })
 } 
}
     
     




const fetchDotEnvFiles = async () => {
  for(var i=0; i< 10; i++) {
  	 gh.rest.search.commits({q: 'delete .env', page:i, order: 'asc', sort: 'indexed', per_page:100}).then(res => {
		console.log(res.data.items.map(item => item.html_url))
     })
   }
}

const runFetchDotEnv = async () => {
  const isRateLimited = await gh.rest.rateLimit.get()
  if(isRateLimited.data.rate.limit > 0) {
    console.log('jon your good for', isRateLimited.data.rate.limit)
    fetchDotEnvFiles()
   }
  else {
   console.log('should sleep')
  }
	
}

const runSearchCode = async () => {
 const isRateLimited = await gh.rest.rateLimit.get()
 if(isRateLimited.data.rate.limit > 0) {
   console.log('jon your good for', isRateLimited.data.rate.limit)
  runBot()
 }
 else {
  console.log('should sleep')
 }
} 


//runSearchCode()
runFetchDotEnv()
