import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';
import Link from 'next/dist/client/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';

import { FiCalendar,FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination  } : HomeProps ) {
  const { next_page } = postsPagination;
  const [ posts, setPosts] = useState<Post[]>(postsPagination.results.map((post : Post) => {
      return {
        uid:post.uid ,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })
  );
  const [ nextPage, setNextPage] = useState(next_page);

  async function handleNextPagePosts() : Promise<void>{

    if(nextPage === null){
      return;
    }

    const response = await fetch(next_page);

    const resultsNextPage = await response.json();

    setPosts([
      ...posts,
      ...resultsNextPage.results.map((post : Post) => {
        return {
          uid:post.uid ,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      })
    ]);

    setNextPage(resultsNextPage.next_page);

  }


  return(
    <>
      <Head>
        <title>Home | Posts</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a >
                  <h2>{post.data.title}</h2>
                  <h4> {post.data.subtitle}</h4>

                  <div className={styles.postsFooter}>
                    <time><FiCalendar/> {format(new Date(post.first_publication_date), "d MMM uuuu",{  locale: ptBR  })}</time>
                    <p><FiUser/> {post.data.author}</p>
                  </div>

                </a>
              </Link>
            ))
          }
          {
            nextPage && (
              <button
                type="button"
                onClick={handleNextPagePosts}
              >
                <strong>Carregar mais posts</strong>
              </button>
            )
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps:  GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [
      Prismic.predicates.at('document.type','pos')
    ],
    {
      pageSize: 4,
    }
  );

  const results = postsResponse.results.map( post => {

    return {
      uid:post.uid ,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const next_page = postsResponse.next_page;

  return {
    props: {
      postsPagination :{
        next_page,
        results,
      }
    }
  }

};
