import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Product } from './product';
import { DepartmentService } from './department.service';
import { map, tap, filter } from 'rxjs/operators';
import { Department } from './department';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  pipe(arg0: import("rxjs").MonoTypeOperatorFunction<{}>) {
    throw new Error("Method not implemented.");
  }

  readonly url = 'http://localhost:3000/products';
  private productsSubject$: BehaviorSubject<Product[]> = new  BehaviorSubject<Product[]>(null);
  private loaded: boolean;

  constructor(private http: HttpClient,
    private departmetService: DepartmentService) { 
    }

  get(): Observable<Product[]> {
    
    if(! this.loaded){
      //juntando os dois observables
      combineLatest(
        this.http.get<Product[]>(this.url),
        this.departmetService.get()
      ).pipe(
        tap(([producst,departments]) => console.log([producst,departments])),
        filter(([products, departmetns]) => products!= null && departmetns != null),
        map(([products, departmetns]) => {
          for(let p of products){
            let ids = (p.departments as string[]);
            //mapeando cada id e retornando o departamento selecionado
            p.departments = ids.map((id)=> departmetns.find(dep=> dep._id==id));
          }
          return products;
        }),
        tap((producst) => console.log(producst))
      )
      .subscribe(this.productsSubject$);
      this.loaded = true;
    }
    return this.productsSubject$.asObservable();
  }

  add(prod: Product): Observable<Product> {
    let departments = (prod.departments as  Department[]).map(d=> d._id);
    return this.http.post<Product>(this.url, {...prod, departments})
      .pipe(
        tap((p) => {
          this.productsSubject$.getValue()
            .push({...prod, _id: p._id})
        })
      )
  }

  del(prod: Product): Observable<any> {
    return this.http.delete(`${this.url}/${prod._id}`)
      .pipe(
        tap(() => {
          let products = this.productsSubject$.getValue();
          let i = products.findIndex(p => p._id ===prod._id);
          if( i >=0){
            products.splice(i,1);
          }
        })
      )
  }

  update(prod: Product): Observable<Product> {
    let departments = (prod.departments as  Department[]).map(d=> d._id);
    return  this.http.patch<Product>(`${this.url}/${prod._id}`, {...prod, departments})
    .pipe(
      tap(() => {
        let products = this.productsSubject$.getValue();
        let i = products.findIndex(p => p._id ===prod._id);
        if( i >=0){
          products[i] = prod;
        }
      })
    )
  }
}
