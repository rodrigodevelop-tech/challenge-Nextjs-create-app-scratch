import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from "prismic-dom";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }:PostProps) {
  const router = useRouter();

  console.log(post);

  const totalWords = post.data.content.reduce((total, contentItem) => {

    const words = RichText.asText(contentItem.body).split(' ');

    words.map(word => {
      total += word.length
    });

    return total
  }, 0);

  const readTimeTotal = Math.ceil(totalWords / 200);


  if(router.isFallback){
    return <div>Carregando...</div>
  }

  return (
    <>
      <h1>Post</h1>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [
      Prismic.predicates.at('document.type','pos')
    ],
    {
      pageSize: 20
    }
  );

  const slugsPosts = posts.results.map( post => (
      {
        params: {
          slug: post.uid,
        }
      }
    ));

  return {
    paths: slugsPosts,
    fallback: true
  }
};

export const getStaticProps : GetStaticProps = async context => {

  const prismic = getPrismicClient();

  const slug = context.params.slug;

  const response = await prismic.getByUID('pos',String(slug),{});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map( content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      }),
    }
  }


  return {
    props : {
      post
    },
    redirect: 60 * 30, // calcular tempo de leitura
  }
};
