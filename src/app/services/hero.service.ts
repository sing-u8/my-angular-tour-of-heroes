import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators';

import {Hero} from '../schemas/hero'
import {HEROES} from '../mocks/mock-heroes'
import {MessageService} from '../services/message.service'

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  // :base/:collectionName과 같은 형태로 정의
  //  base는 어떤 종류의 요청인지 구별하는 변수이며, collectionName은 in-memory-data-service.ts 파일에 있는 콜렉션을 구별하는 변수
  private heroesUrl:string = 'api/heroes';
  public httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  constructor(private messageService: MessageService, private http: HttpClient) { }

  /**
   * HttpClient.get 함수는 HTTP 응답으로 받은 몸체(body) 를 반환하는데, 이 객체는 타입이 지정되지 않은 JSON 객체로 처리됩니다. 그래서 이 객체에 타입을 지정하려면 <Hero[]>와 같이 제네릭을 지정하면 됩니다.
   * **/
  getHeroes(): Observable<Hero[]>{
    return this.http.get<Hero[]>(this.heroesUrl)
            .pipe(
              tap(_ => this.log(`fetched heroes:`)),
              catchError(this.handleError<Hero[]>('getHeroes', []))
            )
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>("updateHero"))
    )
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    )
  }

  /** DELETE: 서버에서 히어로를 제거합니다. */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === "number" ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id};`)),
      catchError(this.handleError<Hero>("deleteHero"))
    );
  }

  /* GET: 입력된 문구가 이름에 포함된 히어로 목록을 반환합니다. */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // 입력된 내용이 없으면 빈 배열을 반환합니다.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x =>
        x.length
          ? this.log(`found heroes matching "${term}"`)
          : this.log(`no heroes matching "${term}"`)
      ),
      catchError(this.handleError<Hero[]>("searchHeroes", []))
    );
  }


  /**
   * HTTP 요청이 실패한 경우를 처리합니다.
   * 애플리케이션 로직 흐름은 그대로 유지됩니다.
   * @param operation - 실패한 동작의 이름
   * @param result - 기본값으로 반환할 객체
   * 이 때 서비스의 각 메소드는 서로 다른 타입으로 Observable 결과를 반환하기 때문에 handleError() 메소드는 각 메소드의 기본값을 인자로 받을수 있도록 정의했습니다.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: 리모트 서버로 에러 메시지 보내기
      console.error(error); // 지금은 콘솔에 로그를 출력합니다.
      // TODO: 사용자가 이해할 수 있는 형태로 변환하기
      this.log(`${operation} failed: ${error.message}`);
      // 애플리케이션 로직이 끊기지 않도록 기본값으로 받은 객체를 반환합니다.
      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
