import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Hero } from '@schemas/hero';
import { HeroService } from '@services/hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss']
})
export class HeroSearchComponent implements OnInit {

  heroes$: Observable<Hero[]>;
  private searchTerms = new Subject<string>();
  constructor(private heroService: HeroService) {}

  // 사용자가 입력한 검색어를 옵저버블 스트림으로 보냅니다.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.heroes$ = this.searchTerms.pipe(
      // 연속된 키입력을 처리하기 위해 300ms 대기합니다.
      debounceTime(300),

      // 이전에 입력한 검색어와 같으면 무시합니다.
      distinctUntilChanged(),

      // 검색어가 변경되면 새로운 옵저버블을 생성합니다.
      /**
       * switchMap()는 옵저버블 스트림이 debounce와 distinctUntilChanged를 통과했을 때 서비스에 있는 검색 기능을 호출합니다. 이 때 이전에 발생했던 옵저버블은 취소되며, HeroService가 생성한 옵저버블만 반환합니다.
       */
      switchMap((term: string) => {
        console.log('switchMap term: ',term);
        return this.heroService.searchHeroes(term)
      }),
    );
  }

}


/**
 * switchMap 연산자를 사용하면 옵저버블 체이닝을 통과한 키이벤트마다 HttpClient.get() 메소드가 실행됩니다. 그런데 요청을 300ms 당 한 번으로 제한하더라도 동작중인 HTTP 요청은 여러개가 될 수 있으며, 응답이 돌아오는 순서도 보낸 순서와 다를 수 있습니다.

이 때 switchMap() 연산자를 활용하면 이전에 보낸 HTTP 요청을 취소하고 제일 마지막에 보낸 HTTP 요청만 남겨둘 수 있습니다.

하지만 이전에 발생한 searchHeroes() Observable 을 취소했다고 해서 이미 보낸 HTTP 요청을 취소하지는 않습니다. 이미 보낸 HTTP 요청에 대한 응답은 애플리케이션 코드에 도달하지 못하고 그냥 폐기됩니다.
 */
